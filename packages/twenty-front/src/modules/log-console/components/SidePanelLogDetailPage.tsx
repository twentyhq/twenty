import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { formatInTimeZone } from 'date-fns-tz';
import { isDefined } from 'twenty-shared/utils';
import { JsonTree, LightButton, Section } from 'twenty-ui/components';
import { IconCopy } from 'twenty-ui/icon';
import { Chip, Tag } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { type JsonValue } from 'type-fest';

import { TimeFormat } from '@/localization/constants/TimeFormat';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { LOG_CONSOLE_LEVELS } from '@/log-console/constants/LogConsoleLevels';
import { useLogConsoleTimeZone } from '@/log-console/hooks/useLogConsoleTimeZone';
import { logConsoleSelectedLogState } from '@/log-console/states/logConsoleSelectedLogState';
import { type LogConsoleSeverity } from '@/log-console/types/LogConsoleSeverity';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import {
  SettingsTableCard,
  type TableItem,
} from '@/settings/components/SettingsTableCard';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const MESSAGE_COLORS_BY_SEVERITY: Record<
  LogConsoleSeverity,
  { background: string; text: string }
> = {
  error: {
    background: themeCssVariables.tag.background.red,
    text: themeCssVariables.tag.text.red,
  },
  warning: {
    background: themeCssVariables.tag.background.orange,
    text: themeCssVariables.tag.text.orange,
  },
};

const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  overflow-wrap: anywhere;
`;

const StyledTimestamp = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledSubtitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledMessage = styled.pre<{ severity?: LogConsoleSeverity }>`
  background-color: ${({ severity }) =>
    isDefined(severity)
      ? MESSAGE_COLORS_BY_SEVERITY[severity].background
      : themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${({ severity }) =>
    isDefined(severity)
      ? MESSAGE_COLORS_BY_SEVERITY[severity].text
      : themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.code.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  margin: 0;
  overflow-wrap: anywhere;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  white-space: pre-wrap;
`;

const StyledRawEvent = styled.div`
  overflow-x: auto;
`;

export const SidePanelLogDetailPage = () => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const timeZone = useLogConsoleTimeZone();
  const { dateFormat, timeFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const logConsoleSelectedLog = useAtomStateValue(logConsoleSelectedLogState);
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  if (!isDefined(logConsoleSelectedLog)) {
    return null;
  }

  const { source, entry } = logConsoleSelectedLog;
  const { __typename, ...rawEvent } = entry;
  const level = LOG_CONSOLE_LEVELS[entry.properties?.level];
  const message = entry.properties?.message ?? entry.properties?.error;
  const objectMetadataItem = objectMetadataItemsByIdMap.get(
    entry.objectMetadataId ?? '',
  );

  const timeWithMillisecondsFormat =
    timeFormat === TimeFormat.HOUR_12 ? 'h:mm:ss.SSS aa' : 'HH:mm:ss.SSS';

  const detailItems: TableItem[] = [
    ...(isDefined(objectMetadataItem)
      ? [
          {
            label: t`Object`,
            value: (
              <Chip
                startElement={
                  <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
                }
                style={{ paddingInlineStart: 0 }}
              >
                {objectMetadataItem.labelPlural}
              </Chip>
            ),
          },
        ]
      : []),
    ...[
      ...source.columns.filter((column) => !column.hiddenInDetails),
      ...(source.detailFields ?? []),
    ].flatMap((field) => {
      const value = field.renderCell(entry);

      return isDefined(value) ? [{ label: t(field.label), value }] : [];
    }),
    ...source.idFields.flatMap((idField) => {
      const id = idField.getId(entry);

      return isNonEmptyString(id)
        ? [
            {
              label: t(idField.label),
              value: (
                <OverflowingTextWithTooltip
                  text={<>{id}</>}
                  tooltipContent={id}
                />
              ),
              onClick: () => copyToClipboard(id),
            },
          ]
        : [];
    }),
  ];

  return (
    <StyledPage>
      <StyledHeader>
        <StyledTitle>
          {source.renderDetailTitle?.(entry) ?? (
            <>
              {isDefined(level) && (
                <Tag color={level.color} variant={level.variant}>
                  {t(level.label)}
                </Tag>
              )}
              {entry.event}
            </>
          )}
        </StyledTitle>
        <StyledTimestamp>
          {formatInTimeZone(
            entry.timestamp,
            timeZone,
            `EEE, ${dateFormat} · ${timeWithMillisecondsFormat} zzz`,
            { locale: localeCatalog },
          )}
          {' · '}
          {beautifyPastDateRelativeToNow(entry.timestamp, localeCatalog)}
        </StyledTimestamp>
        {isDefined(source.renderDetailSubtitle) && (
          <StyledSubtitle>{source.renderDetailSubtitle(entry)}</StyledSubtitle>
        )}
      </StyledHeader>
      {isNonEmptyString(message) && (
        <Section.Root>
          <Section.Header
            title={t`Message`}
            adornment={
              <LightButton
                startIcon={<IconCopy />}
                onClick={() => copyToClipboard(message)}
              >
                {t`Copy`}
              </LightButton>
            }
          />
          <StyledMessage severity={source.getSeverity?.(entry)}>
            {message}
          </StyledMessage>
        </Section.Root>
      )}
      {source.renderDetailContent?.(entry)}
      <Section.Root>
        <Section.Header title={t`Details`} />
        <SettingsTableCard
          items={detailItems}
          rounded
          gridAutoColumns="minmax(0, 2fr) minmax(0, 3fr)"
        />
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Raw event`}
          adornment={
            <LightButton
              startIcon={<IconCopy />}
              onClick={() =>
                copyToClipboard(
                  JSON.stringify(rawEvent, null, 2),
                  t`Log copied as JSON`,
                )
              }
            >
              {t`Copy as JSON`}
            </LightButton>
          }
        />
        <StyledRawEvent>
          <JsonTree
            value={rawEvent as JsonValue}
            emptyArrayLabel={t`Empty Array`}
            emptyObjectLabel={t`Empty Object`}
            emptyStringLabel={t`[empty string]`}
            arrowButtonCollapsedLabel={t`Expand`}
            arrowButtonExpandedLabel={t`Collapse`}
            onNodeValueClick={copyToClipboard}
          />
        </StyledRawEvent>
      </Section.Root>
    </StyledPage>
  );
};
