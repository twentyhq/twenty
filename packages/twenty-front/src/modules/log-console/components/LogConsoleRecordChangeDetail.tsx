import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { IconArrowUpRight, useIcons } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { EventFieldDiffValue } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValue';
import { EventFieldDiffValueEffect } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValueEffect';
import { EventRelationFieldDiffValues } from '@/activities/timeline-activities/rows/main-object/components/EventRelationFieldDiffValues';
import { StyledLogConsoleFieldsCard } from '@/log-console/components/StyledLogConsoleFieldsCard';
import { LOG_CONSOLE_RECORD_ACTIONS } from '@/log-console/constants/LogConsoleRecordActions';
import { getLogConsoleRecordChangeFieldDiffs } from '@/log-console/utils/getLogConsoleRecordChangeFieldDiffs';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { BillingFieldRow } from '@/settings/billing/components/internal/SettingsBillingCardField';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type EventLogRecord } from '~/generated-metadata/graphql';

const StyledRecordChange = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledEmptyValue = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledOpenRecordButton = styled(Button)`
  align-self: flex-start;
`;

type LogConsoleRecordChangeDetailProps = {
  entry: EventLogRecord;
};

export const LogConsoleRecordChangeDetail = ({
  entry,
}: LogConsoleRecordChangeDetailProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const diffId = useId();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const action = LOG_CONSOLE_RECORD_ACTIONS[entry.event];
  const objectMetadataItem = objectMetadataItemsByIdMap.get(
    entry.objectMetadataId ?? '',
  );
  const recordSnapshot = entry.properties?.after ?? entry.properties?.before;

  if (!isDefined(action) || !isDefined(objectMetadataItem)) {
    return null;
  }

  const fieldDiffs = getLogConsoleRecordChangeFieldDiffs({
    entry,
    objectMetadataItem,
  });

  const displayedSnapshot = action.valuesSnapshot ?? 'after';

  const renderFieldValue = ({
    fieldMetadataItem,
    value,
    recordStoreId,
  }: {
    fieldMetadataItem: FieldMetadataItem;
    value: unknown;
    recordStoreId: string;
  }) => {
    if (
      isFieldValueEmpty({
        fieldDefinition: fieldMetadataItem,
        fieldValue: value,
      })
    ) {
      return <StyledEmptyValue>{t`Empty`}</StyledEmptyValue>;
    }

    if (fieldMetadataItem.type === FieldMetadataType.RELATION) {
      return (
        <EventRelationFieldDiffValues
          fieldDiff={{ before: value, after: value }}
          fieldMetadataItem={fieldMetadataItem}
        />
      );
    }

    return (
      <>
        <EventFieldDiffValueEffect
          diffArtificialRecordStoreId={recordStoreId}
          diffRecord={value as Record<string, unknown>}
          mainObjectMetadataItem={objectMetadataItem}
          fieldMetadataItem={fieldMetadataItem}
        />
        <EventFieldDiffValue
          diffArtificialRecordStoreId={recordStoreId}
          mainObjectMetadataItem={objectMetadataItem}
          fieldMetadataItem={fieldMetadataItem}
        />
      </>
    );
  };

  return (
    <StyledRecordChange>
      {isDefined(action.valuesTitle) &&
        (isNonEmptyArray(fieldDiffs) || !isDefined(recordSnapshot)) && (
          <Section.Root>
            <Section.Header
              title={t(action.valuesTitle)}
              description={
                isDefined(recordSnapshot)
                  ? undefined
                  : t`Permanently deleted records keep no values.`
              }
            />
            {isNonEmptyArray(fieldDiffs) && (
              <StyledLogConsoleFieldsCard>
                {fieldDiffs.map((fieldDiff) => (
                  <BillingFieldRow
                    key={fieldDiff.key}
                    Icon={getIcon(fieldDiff.fieldMetadataItem.icon)}
                    label={fieldDiff.fieldMetadataItem.label}
                  >
                    <ErrorBoundary fallbackRender={() => null}>
                      {renderFieldValue({
                        fieldMetadataItem: fieldDiff.fieldMetadataItem,
                        value: fieldDiff[displayedSnapshot],
                        recordStoreId: `${diffId}-${fieldDiff.key}`,
                      })}
                    </ErrorBoundary>
                  </BillingFieldRow>
                ))}
              </StyledLogConsoleFieldsCard>
            )}
          </Section.Root>
        )}
      {isDefined(recordSnapshot) && (
        <StyledOpenRecordButton
          size="sm"
          startIcon={<IconArrowUpRight />}
          onClick={() =>
            openRecordInSidePanel({
              recordId: recordSnapshot.id,
              objectNameSingular: objectMetadataItem.nameSingular,
            })
          }
        >
          {t`Open record`}
        </StyledOpenRecordButton>
      )}
    </StyledRecordChange>
  );
};
