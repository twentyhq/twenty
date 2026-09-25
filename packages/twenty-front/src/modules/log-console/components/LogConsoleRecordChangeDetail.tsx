import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { IconArrowUpRight } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { EventFieldDiffLabel } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffLabel';
import { EventFieldDiffValue } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValue';
import { EventFieldDiffValueEffect } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValueEffect';
import { EventRelationFieldDiffValues } from '@/activities/timeline-activities/rows/main-object/components/EventRelationFieldDiffValues';
import { LOG_CONSOLE_RECORD_ACTIONS } from '@/log-console/constants/LogConsoleRecordActions';
import { getLogConsoleRecordChangeFieldDiffs } from '@/log-console/utils/getLogConsoleRecordChangeFieldDiffs';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type EventLogRecord } from '~/generated-metadata/graphql';

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

  const valueColumns: { label: string; snapshot: 'before' | 'after' }[] =
    isDefined(action.valuesSnapshot)
      ? [{ label: t`Value`, snapshot: action.valuesSnapshot }]
      : [
          { label: t`Before`, snapshot: 'before' },
          { label: t`After`, snapshot: 'after' },
        ];

  const gridTemplateColumns = `minmax(0, 3fr) repeat(${valueColumns.length}, minmax(0, 4fr))`;

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
    <>
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
              <Table>
                <TableRow gridTemplateColumns={gridTemplateColumns}>
                  <TableHeader>{t`Field`}</TableHeader>
                  {valueColumns.map(({ label, snapshot }) => (
                    <TableHeader key={snapshot}>{label}</TableHeader>
                  ))}
                </TableRow>
                {fieldDiffs.map((fieldDiff) => (
                  <TableRow
                    key={fieldDiff.key}
                    gridTemplateColumns={gridTemplateColumns}
                  >
                    <TableCell overflow="hidden" whiteSpace="nowrap">
                      <EventFieldDiffLabel
                        fieldMetadataItem={fieldDiff.fieldMetadataItem}
                      />
                    </TableCell>
                    {valueColumns.map(({ snapshot }) => (
                      <TableCell
                        key={snapshot}
                        overflow="hidden"
                        whiteSpace="nowrap"
                      >
                        <ErrorBoundary fallbackRender={() => null}>
                          {renderFieldValue({
                            fieldMetadataItem: fieldDiff.fieldMetadataItem,
                            value: fieldDiff[snapshot],
                            recordStoreId: `${diffId}-${snapshot}-${fieldDiff.key}`,
                          })}
                        </ErrorBoundary>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </Table>
            )}
          </Section.Root>
        )}
      {isDefined(recordSnapshot) && (
        <StyledOpenRecordButton
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
    </>
  );
};
