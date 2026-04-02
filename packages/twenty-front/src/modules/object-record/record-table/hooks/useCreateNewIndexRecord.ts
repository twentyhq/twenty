import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useBuildRecordInputFromRLSPredicates } from '@/object-record/hooks/useBuildRecordInputFromRLSPredicates';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { draftRecordIdsState } from '@/object-record/record-side-panel/states/draftRecordIdsState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useBuildRecordInputFromFilters } from '@/object-record/record-table/hooks/useBuildRecordInputFromFilters';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { stripSimpleQuotesFromString } from '~/utils/string/stripSimpleQuotesFromString';

type UseCreateNewIndexRecordProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  instanceId?: string;
};

export const useCreateNewIndexRecord = ({
  objectMetadataItem,
  instanceId,
}: UseCreateNewIndexRecordProps) => {
  const store = useStore();

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const { buildRecordInputFromFilters } = useBuildRecordInputFromFilters({
    objectMetadataItem,
    instanceId,
  });

  const { buildRecordInputFromRLSPredicates } =
    useBuildRecordInputFromRLSPredicates({
      objectMetadataItem,
    });

  // Pre-fetch agent profile for the current workspace member.
  // This is a fallback for when RLS predicates don't resolve the agent field
  // (e.g., admin role without "Agent is Me" RLS, or restricted field skipping).
  const agentRelationField = objectMetadataItem.fields.find(
    (f) =>
      f.type === 'RELATION' &&
      f.relation?.targetObjectMetadata.nameSingular === 'agentProfile',
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const shouldSkipAgentLookup =
    !isDefined(agentRelationField) || !isDefined(currentWorkspaceMember?.id);
  const { records: agentProfiles } = useFindManyRecords({
    // Use the current object as a safe fallback when agentProfile doesn't exist
    // in metadata — the query is skipped anyway via the skip parameter.
    objectNameSingular: isDefined(agentRelationField)
      ? 'agentProfile'
      : objectMetadataItem.nameSingular,
    filter: isDefined(currentWorkspaceMember?.id)
      ? { workspaceMemberId: { eq: currentWorkspaceMember.id } }
      : undefined,
    skip: shouldSkipAgentLookup,
    limit: 1,
  });

  const openDraftInSidePanel = useCallback(
    (recordInput?: Partial<ObjectRecord>) => {
      const recordId = v4();
      const recordInputFromRLSPredicates = buildRecordInputFromRLSPredicates({
        includeRestrictedFields: true,
      });
      const recordInputFromFilters = buildRecordInputFromFilters();

      const { position, ...restRecordInput } = recordInput ?? {};

      // Build default values from field metadata
      const fieldDefaults: Record<string, unknown> = {};
      const now = new Date().toISOString();

      for (const field of objectMetadataItem.fields) {
        if (!isDefined(field.defaultValue) || field.defaultValue === null) {
          continue;
        }

        if (
          field.type === FieldMetadataType.SELECT &&
          typeof field.defaultValue === 'string'
        ) {
          fieldDefaults[field.name] = stripSimpleQuotesFromString(
            field.defaultValue,
          );
        } else if (
          field.type === FieldMetadataType.TEXT &&
          typeof field.defaultValue === 'string'
        ) {
          const stripped = stripSimpleQuotesFromString(field.defaultValue);
          if (stripped !== '') {
            fieldDefaults[field.name] = stripped;
          }
        } else if (
          field.type === FieldMetadataType.BOOLEAN &&
          typeof field.defaultValue === 'boolean'
        ) {
          fieldDefaults[field.name] = field.defaultValue;
        } else if (
          field.type === FieldMetadataType.NUMBER &&
          typeof field.defaultValue === 'number'
        ) {
          fieldDefaults[field.name] = field.defaultValue;
        }
      }

      // Set system fields
      const currentMember = store.get(currentWorkspaceMemberState.atom);
      if (isDefined(currentMember)) {
        const memberName =
          `${currentMember.name?.firstName ?? ''} ${currentMember.name?.lastName ?? ''}`.trim();
        const actorValue = {
          source: 'MANUAL',
          workspaceMemberId: currentMember.id,
          name: memberName,
          context: null,
        };
        fieldDefaults.createdBy = actorValue;
        fieldDefaults.updatedBy = actorValue;
      }
      fieldDefaults.createdAt = now;
      fieldDefaults.updatedAt = now;

      // Set submittedDate for objects that have it (e.g., Policy)
      const submittedDateField = objectMetadataItem.fields.find(
        (f) => f.name === 'submittedDate' && f.isActive,
      );
      if (isDefined(submittedDateField)) {
        fieldDefaults.submittedDate = now;
      }

      // Prefill agent from workspace member's agent profile
      if (
        isDefined(agentRelationField) &&
        agentProfiles.length > 0
      ) {
        fieldDefaults[`${agentRelationField.name}Id`] = agentProfiles[0].id;
        fieldDefaults[agentRelationField.name] = agentProfiles[0];
      }

      // Filter out undefined/null values from RLS so they don't overwrite defaults
      const definedRLSValues: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(recordInputFromRLSPredicates)) {
        if (isDefined(value)) {
          definedRLSValues[key] = value;
        }
      }

      const seedValues = {
        id: recordId,
        ...fieldDefaults,
        ...definedRLSValues,
        ...recordInputFromFilters,
        ...restRecordInput,
      } as ObjectRecord;

      // 1. Seed draft in record store
      store.set(recordStoreFamilyState.atomFamily(recordId), seedValues);

      // 2. Track as draft with metadata
      const draftMap = new Map(store.get(draftRecordIdsState.atom));
      draftMap.set(recordId, {
        objectNameSingular: objectMetadataItem.nameSingular,
        objectMetadataItem,
        hiddenFieldNames: new Set([
          'position',
          ...Object.keys(recordInputFromRLSPredicates),
        ]),
        extraRecordInput: isDefined(position) ? { position } : {},
      });
      store.set(draftRecordIdsState.atom, draftMap);

      // 3. Open side panel with draft
      openRecordInSidePanel({
        recordId,
        objectNameSingular: objectMetadataItem.nameSingular,
        isNewRecord: true,
      });
    },
    [
      agentRelationField,
      agentProfiles,
      store,
      buildRecordInputFromRLSPredicates,
      buildRecordInputFromFilters,
      objectMetadataItem,
      openRecordInSidePanel,
    ],
  );

  return {
    openDraftInSidePanel,
  };
};
