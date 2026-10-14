import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { formatInTimeZone } from 'date-fns-tz';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { JsonTree } from 'twenty-ui/components/data-display';
import { LightButton } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { IconCopy, IconId } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { LogConsoleDetailPanelLayout } from '@/log-console/components/LogConsoleDetailPanelLayout';
import { StyledLogConsoleFieldsCard } from '@/log-console/components/StyledLogConsoleFieldsCard';
import { useLogConsoleTimeZone } from '@/log-console/hooks/useLogConsoleTimeZone';
import { logConsoleSelectedLogState } from '@/log-console/states/logConsoleSelectedLogState';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { FieldWidgetShowMoreButton } from '@/page-layout/widgets/field/components/FieldWidgetShowMoreButton';
import { BillingFieldRow } from '@/settings/billing/components/internal/SettingsBillingCardField';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type EventLogRecord } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const COLLAPSED_MESSAGE_STACK_LINE_COUNT = 1;

const StyledMessageCard = styled(Card.Root)`
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledMessageFirstLine = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow-wrap: anywhere;
`;

const StyledMessageStackLine = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledCopyableId = styled.div`
  cursor: pointer;
  min-width: 0;
`;

const StyledRawEvent = styled.div`
  overflow-x: auto;
`;

export const LogConsoleDetailPanel = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { copyToClipboard } = useCopyToClipboard();
  const timeZone = useLogConsoleTimeZone();
  const { dateFormat, timeFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const [logConsoleSelectedLog, setLogConsoleSelectedLog] = useAtomState(
    logConsoleSelectedLogState,
  );
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );
  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );
  const [entryWithExpandedMessage, setEntryWithExpandedMessage] =
    useState<EventLogRecord>();

  if (!isDefined(logConsoleSelectedLog)) {
    return null;
  }

  const { source, entry } = logConsoleSelectedLog;
  const { __typename, ...rawEvent } = entry;
  const rawMessage = entry.properties?.message ?? entry.properties?.error;
  const message: string | undefined = isString(rawMessage)
    ? rawMessage
    : undefined;
  const objectMetadataItem = objectMetadataItemsByIdMap.get(
    entry.objectMetadataId ?? '',
  );
  const recordSnapshot = entry.properties?.after ?? entry.properties?.before;

  const recordIdentifier =
    isDefined(objectMetadataItem) && isDefined(recordSnapshot)
      ? getObjectRecordIdentifier({
          objectMetadataItem,
          record: recordSnapshot,
          allowRequestsToTwentyIcons,
        })
      : undefined;

  const DetailIcon = source.DetailIcon ?? source.Icon;

  const title = isDefined(recordIdentifier)
    ? recordIdentifier.name
    : source.getDetailTitle(entry, { objectMetadataItem });

  const timeWithMillisecondsFormat =
    timeFormat === TimeFormat.HOUR_12 ? 'h:mm:ss.SSS aa' : 'HH:mm:ss.SSS';

  const formattedTimestamp = formatInTimeZone(
    entry.timestamp,
    timeZone,
    `${timeWithMillisecondsFormat} · ${dateFormat}`,
    { locale: localeCatalog },
  );

  const [firstMessageLine, ...messageStackLines] = (message ?? '').split('\n');

  const displayedMessageStackLines =
    entryWithExpandedMessage === entry
      ? messageStackLines
      : messageStackLines.slice(0, COLLAPSED_MESSAGE_STACK_LINE_COUNT);

  const hiddenMessageStackLineCount =
    messageStackLines.length - displayedMessageStackLines.length;

  const detailItems = [
    ...source.detailFields.flatMap(({ label, Icon, renderValue }) => {
      const value = renderValue(entry, {
        formattedTimestamp,
        objectMetadataItem,
      });

      return isDefined(value) ? [{ Icon, label: t(label), value }] : [];
    }),
    ...source.idFields.flatMap(({ label, Icon = IconId, getId }) => {
      const id = getId(entry);

      return isNonEmptyString(id)
        ? [
            {
              Icon,
              label: t(label),
              value: (
                <StyledCopyableId onClick={() => copyToClipboard(id)}>
                  <OverflowingTextWithTooltip
                    text={<>{id}</>}
                    tooltipContent={id}
                  />
                </StyledCopyableId>
              ),
            },
          ]
        : [];
    }),
  ];

  return (
    <LogConsoleDetailPanelLayout
      onClose={() => setLogConsoleSelectedLog(null)}
      title={isNonEmptyString(title) ? title : t`Untitled`}
      avatar={
        isDefined(recordIdentifier)
          ? {
              src: getAbsoluteImageUrl(recordIdentifier.avatarUrl ?? ''),
              name: recordIdentifier.name,
              colorSeed: recordIdentifier.id,
              shape: recordIdentifier.avatarShape ?? undefined,
            }
          : undefined
      }
      icon={
        isDefined(entry.objectMetadataId) ? (
          <ObjectMetadataIcon
            objectMetadataItem={objectMetadataItem}
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.sm}
          />
        ) : (
          <DetailIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        )
      }
    >
      {isNonEmptyString(message) && (
        <Section.Root>
          <Section.Header
            title={t`Message`}
            actions={
              <LightButton
                startIcon={<IconCopy />}
                onClick={() => copyToClipboard(message)}
              >
                {t`Copy`}
              </LightButton>
            }
          />
          <StyledMessageCard
            backgroundColor={themeCssVariables.background.secondary}
          >
            <StyledMessageFirstLine>{firstMessageLine}</StyledMessageFirstLine>
            {displayedMessageStackLines.map((messageStackLine, index) => (
              <StyledMessageStackLine key={index}>
                <OverflowingTextWithTooltip text={messageStackLine.trim()} />
              </StyledMessageStackLine>
            ))}
            {hiddenMessageStackLineCount > 0 && (
              <FieldWidgetShowMoreButton
                remainingCount={hiddenMessageStackLineCount}
                onClick={() => setEntryWithExpandedMessage(entry)}
              />
            )}
          </StyledMessageCard>
        </Section.Root>
      )}
      {source.renderDetailContent?.(entry)}
      <Section.Root>
        <Section.Header title={t`Details`} />
        <StyledLogConsoleFieldsCard>
          {detailItems.map(({ Icon, label, value }) => (
            <BillingFieldRow key={label} Icon={Icon} label={label}>
              {value}
            </BillingFieldRow>
          ))}
        </StyledLogConsoleFieldsCard>
      </Section.Root>
      <Section.Root>
        <Section.Header
          title={t`Raw event`}
          actions={
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
            value={rawEvent}
            emptyArrayLabel={t`Empty Array`}
            emptyObjectLabel={t`Empty Object`}
            emptyStringLabel={t`[empty string]`}
            arrowButtonCollapsedLabel={t`Expand`}
            arrowButtonExpandedLabel={t`Collapse`}
            onNodeValueClick={copyToClipboard}
          />
        </StyledRawEvent>
      </Section.Root>
    </LogConsoleDetailPanelLayout>
  );
};
