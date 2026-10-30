import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { normalizeSearchText } from 'twenty-ui/utilities';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { useRelatedRecordPathMutations } from '@/related-record-paths/hooks/useRelatedRecordPathMutations';
import { RELATED_RECORD_PATH_MAXIMUM_FIELD_COUNT } from '@/related-record-paths/constants/RelatedRecordPathMaximumFieldCount';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { getRelatedRecordPathNextFieldMetadataItems } from '@/related-record-paths/utils/getRelatedRecordPathNextFieldMetadataItems';
import { getRelatedRecordPathSteps } from '@/related-record-paths/utils/getRelatedRecordPathSteps';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';

type SettingsObjectRelatedRecordPathPickerProps = {
  sourceObjectMetadataItem: EnrichedObjectMetadataItem;
};

export const SettingsObjectRelatedRecordPathPicker = ({
  sourceObjectMetadataItem,
}: SettingsObjectRelatedRecordPathPickerProps) => {
  const { t } = useLingui();
  const [fieldMetadataIds, setFieldMetadataIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const { createRelatedRecordPath } = useRelatedRecordPathMutations();
  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();

  const steps = getRelatedRecordPathSteps({
    sourceObjectMetadataItem,
    fieldMetadataIds,
    objectMetadataItems,
  });
  const lastStep = steps.at(-1);
  const isLastHop =
    steps.length === RELATED_RECORD_PATH_MAXIMUM_FIELD_COUNT - 1;

  const candidateFieldMetadataItems =
    getRelatedRecordPathNextFieldMetadataItems({
      sourceObjectMetadataItem,
      steps,
    })
      .filter((fieldMetadataItem) =>
        normalizeSearchText(fieldMetadataItem.label).includes(
          normalizeSearchText(searchInput),
        ),
      )
      .sort((left, right) => left.label.localeCompare(right.label));

  const navigateTo = (nextFieldMetadataIds: string[]) => {
    setSearchInput('');
    setFieldMetadataIds(nextFieldMetadataIds);
  };

  const createPath = ([
    firstFieldMetadataId,
    secondFieldMetadataId,
    thirdFieldMetadataId,
  ]: string[]) =>
    createRelatedRecordPath({
      objectMetadataId: sourceObjectMetadataItem.id,
      firstFieldMetadataId,
      secondFieldMetadataId,
      thirdFieldMetadataId,
      isInherent: false,
    });

  return (
    <>
      <Dropdown.Header>
        {isNonEmptyArray(steps) && (
          <LightIconButton
            size="sm"
            aria-label={t`Back`}
            onClick={() => navigateTo(fieldMetadataIds.slice(0, -1))}
          >
            <IconChevronLeft />
          </LightIconButton>
        )}
        <Dropdown.Title>
          {lastStep?.fieldMetadataItem.label ??
            sourceObjectMetadataItem.labelPlural}
        </Dropdown.Title>
        <Dropdown.Close aria-label={t`Close`} />
      </Dropdown.Header>
      <Dropdown.Search
        key={fieldMetadataIds.join('.')}
        autoFocus
        aria-label={t`Search relations`}
        placeholder={t`Search relations`}
        value={searchInput}
        onValueChange={setSearchInput}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        {isDefined(lastStep) && !isNonEmptyString(searchInput) && (
          <>
            <Dropdown.OptionItem
              description={t`Add this path`}
              startIcon={
                <SelectOptionIcon
                  Icon={getIcon(lastStep.targetObjectMetadataItem.icon)}
                  color={getObjectColorWithFallback(
                    lastStep.targetObjectMetadataItem,
                  )}
                />
              }
              onSelect={() => createPath(fieldMetadataIds)}
            >
              {lastStep.targetObjectMetadataItem.labelPlural}
            </Dropdown.OptionItem>
            {isNonEmptyArray(candidateFieldMetadataItems) && (
              <Dropdown.Separator />
            )}
          </>
        )}
        {candidateFieldMetadataItems.map((fieldMetadataItem) => {
          const nextFieldMetadataIds = [
            ...fieldMetadataIds,
            fieldMetadataItem.id,
          ];

          return (
            <Dropdown.OptionItem
              key={fieldMetadataItem.id}
              hasSubmenu={!isLastHop}
              closeOnSelect={isLastHop}
              description={
                findRelationTargetObjectMetadataItem({
                  fieldMetadataItem,
                  objectMetadataItems,
                })?.labelPlural
              }
              startIcon={
                <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
              }
              onSelect={() =>
                isLastHop
                  ? createPath(nextFieldMetadataIds)
                  : navigateTo(nextFieldMetadataIds)
              }
            >
              {fieldMetadataItem.label}
            </Dropdown.OptionItem>
          );
        })}
        {!isDefined(lastStep) &&
          !isNonEmptyArray(candidateFieldMetadataItems) && (
            <Dropdown.Empty>{t`No relations`}</Dropdown.Empty>
          )}
      </Dropdown.Section>
    </>
  );
};
