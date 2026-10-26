import { useState } from 'react';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { v4 } from 'uuid';
import { themeCssVariables } from 'twenty-ui/theme';
import { Section } from 'twenty-ui/components/layout';
import { useToast } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { IconPlus, IconTrash, IconArrowRight } from 'twenty-ui/icon';
import { type RecordPermissionInheritancePath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useRecordPermissionPolicy } from '@/settings/record-permissions/hooks/useRecordPermissionPolicy';
import { RecordPermissionPolicyStatus } from '@/settings/record-permissions/components/RecordPermissionPolicyStatus';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { Select } from '@/ui/input/components/Select';

const StyledRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: minmax(120px, 1fr) minmax(160px, 2fr) 110px 28px;
  min-height: 40px;
`;
const StyledObject = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;
const StyledForm = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;
const StyledActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${themeCssVariables.spacing[3]};
`;
const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

type SettingsRelatedRecordPermissionsProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  disabled?: boolean;
};
export const SettingsRelatedRecordPermissions = ({
  objectMetadataItem,
  disabled = false,
}: SettingsRelatedRecordPermissionsProps) => {
  const policy = useRecordPermissionPolicy();
  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const { enqueueToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [steps, setSteps] = useState(1);
  const source = objectMetadataItem.universalIdentifier;
  const blocked = disabled || Boolean(policy.state?.candidateRevisionId);
  const paths =
    policy.definition?.objects.flatMap((object) =>
      object.inheritancePaths
        .filter((path) => path.sourceObjectUniversalIdentifier === source)
        .map((path) => ({
          path,
          target: objectMetadataItems.find(
            (item) =>
              item.universalIdentifier === object.objectUniversalIdentifier,
          ),
        })),
    ) ?? [];
  const resolveSteps = (fields: string[]) => {
    let current = objectMetadataItem;
    const visited = new Set([current.id]);
    const resolved: {
      object: EnrichedObjectMetadataItem;
      fieldLabel: string;
    }[] = [];
    for (const identifier of fields) {
      const field = current.fields.find(
        (field) => field.universalIdentifier === identifier,
      );
      const target = objectMetadataItems.find(
        (object) => object.id === field?.relation?.targetObjectMetadata.id,
      );
      if (!field || !target || visited.has(target.id)) break;
      resolved.push({ object: target, fieldLabel: field.label });
      current = target;
      visited.add(current.id);
    }
    return { current, visited, resolved };
  };
  const addPath = () => {
    const { current, resolved } = resolveSteps(selectedFields);
    if (resolved.length === 0 || resolved.length !== steps) return;
    if (
      paths.some(
        ({ path }) =>
          JSON.stringify(path.fieldUniversalIdentifiers) ===
          JSON.stringify(selectedFields),
      )
    ) {
      setEditing(false);
      return;
    }
    const path: RecordPermissionInheritancePath = {
      universalIdentifier: v4(),
      sourceObjectUniversalIdentifier: source,
      fieldUniversalIdentifiers: selectedFields,
    };
    policy.updateDefinition((definition) => {
      const target = definition.objects.find(
        (object) =>
          object.objectUniversalIdentifier === current.universalIdentifier,
      ) ?? {
        objectUniversalIdentifier: current.universalIdentifier,
        rules: [],
        inheritancePaths: [],
      };
      return {
        ...definition,
        objects: [
          ...definition.objects.filter(
            (object) =>
              object.objectUniversalIdentifier !== current.universalIdentifier,
          ),
          { ...target, inheritancePaths: [...target.inheritancePaths, path] },
        ],
      };
    });
    setEditing(false);
    setSelectedFields([]);
    setSteps(1);
  };
  const removePath = (pathId: string) =>
    policy.updateDefinition((definition) => ({
      ...definition,
      objects: definition.objects.map((object) => ({
        ...object,
        inheritancePaths: object.inheritancePaths.filter(
          (path) => path.universalIdentifier !== pathId,
        ),
      })),
    }));
  const save = async () => {
    try {
      await policy.publish();
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };
  return (
    <Section.Root>
      <Section.Header
        title={t`Related records`}
        description={t`Related records inherit every allowed action from this object. Follow up to three relation fields.`}
      />
      <RecordPermissionPolicyStatus />
      <StyledRow>
        <span>{t`Object`}</span>
        <span>{t`Relation`}</span>
        <span>{t`Type`}</span>
        <span />
      </StyledRow>
      {paths.map(({ path, target }) => (
        <StyledRow key={path.universalIdentifier}>
          <StyledObject>
            {target && <ObjectMetadataIcon objectMetadataItem={target} />}
            {target?.labelPlural ?? t`Unavailable object`}
          </StyledObject>
          <span>
            {path.fieldUniversalIdentifiers
              .map(
                (identifier) =>
                  objectMetadataItems
                    .flatMap((object) => object.fields)
                    .find((field) => field.universalIdentifier === identifier)
                    ?.label ?? t`Unavailable field`,
              )
              .join(' → ')}
          </span>
          <span>{t`Inherited`}</span>
          <Button
            size="sm"
            variant="ghost"
            disabled={blocked}
            aria-label={t`Remove related-record path`}
            startIcon={<IconTrash size={14} />}
            onClick={() => removePath(path.universalIdentifier)}
          />
        </StyledRow>
      ))}
      {paths.length === 0 && (
        <StyledHint>{t`No related records inherit access from this object.`}</StyledHint>
      )}
      {editing && (
        <StyledForm>
          {Array.from({ length: steps }, (_, index) => {
            const { current, visited } = resolveSteps(
              selectedFields.slice(0, index),
            );
            const fields = current.fields.filter(
              (field) =>
                isDefined(field.relation) &&
                !visited.has(field.relation.targetObjectMetadata.id),
            );
            return (
              <Select
                key={index}
                dropdownId={`permission-path-${source}-${index}`}
                label={current.labelPlural}
                withSearchInput
                value={selectedFields[index] ?? ''}
                emptyOption={{ value: '', label: t`Choose a relation field` }}
                options={fields.map((field) => ({
                  value: field.universalIdentifier,
                  label: field.label,
                  contextualText: objectMetadataItems.find(
                    (object) =>
                      object.id === field.relation?.targetObjectMetadata.id,
                  )?.labelPlural,
                }))}
                onChange={(identifier) => {
                  setSelectedFields([
                    ...selectedFields.slice(0, index),
                    identifier,
                  ]);
                  setSteps(index + 1);
                }}
              />
            );
          })}
          <StyledHint>{t`Access flows from the original record to the records at the end of this path. Technical intermediary records remain private.`}</StyledHint>
          <StyledActions>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setSelectedFields([]);
                setSteps(1);
              }}
            >{t`Cancel`}</Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={steps === 3 || selectedFields.length < steps}
              startIcon={<IconArrowRight size={14} />}
              onClick={() => setSteps(steps + 1)}
            >{t`Follow another relation`}</Button>
            <Button
              size="sm"
              disabled={selectedFields.length !== steps}
              onClick={addPath}
            >{t`Add relation`}</Button>
          </StyledActions>
        </StyledForm>
      )}
      <StyledActions>
        <Button
          size="sm"
          variant="ghost"
          disabled={blocked || editing}
          startIcon={<IconPlus size={14} />}
          onClick={() => setEditing(true)}
        >{t`Add related records`}</Button>
        {policy.isDirty && (
          <SaveAndCancelButtons
            onSave={save}
            onCancel={policy.reset}
            isLoading={policy.isPublishing}
            isSaveDisabled={blocked}
          />
        )}
      </StyledActions>
    </Section.Root>
  );
};
