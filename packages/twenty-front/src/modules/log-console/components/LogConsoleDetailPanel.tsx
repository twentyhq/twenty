import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { formatInTimeZone } from 'date-fns-tz';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconButton,
  JsonTree,
  LightButton,
  Section,
} from 'twenty-ui/components';
import {
  IconCopy,
  IconId,
  IconLayoutSidebarRightCollapse,
} from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { type JsonValue } from 'type-fest';

import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { StyledLogConsoleFieldsCard } from '@/log-console/components/StyledLogConsoleFieldsCard';
import { LOG_CONSOLE_NARROW_BODY_MAX_WIDTH } from '@/log-console/constants/LogConsoleNarrowBodyMaxWidth';
import { useLogConsoleTimeZone } from '@/log-console/hooks/useLogConsoleTimeZone';
import { logConsoleSelectedLogState } from '@/log-console/states/logConsoleSelectedLogState';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { FieldWidgetShowMoreButton } from '@/page-layout/widgets/field/components/FieldWidgetShowMoreButton';
import { BillingFieldRow } from '@/settings/billing/components/internal/SettingsBillingCardField';
import { APP_HEADER_HEIGHT } from '@/ui/layout/constants/AppHeaderHeight';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type EventLogRecord } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const COLLAPSED_MESSAGE_STACK_LINE_COUNT = 1;

const StyledPanel = styled.aside`
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 400px;

  @container log-console-body (max-width: ${LOG_CONSOLE_NARROW_BODY_MAX_WIDTH}px) {
    border-left: none;
    inset: 0;
    position: absolute;
    width: 100%;
  }
`;

const StyledTopBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.betweenSiblingsGap};
  height: ${APP_HEADER_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

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
  const message: string | undefined =
    entry.properties?.message ?? entry.properties?.error;
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

  const closeLabel = t`Close details`;

  return (
    <StyledPanel>
      <StyledTopBar>
        <IconButton
          size="sm"
          variant="ghost"
          tooltip={closeLabel}
          aria-label={closeLabel}
          onClick={() => setLogConsoleSelectedLog(null)}
        >
          <IconLayoutSidebarRightCollapse />
        </IconButton>
        <HeaderIdentifier
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
              <DetailIcon
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
            )
          }
          iconColor={themeCssVariables.font.color.tertiary}
          title={isNonEmptyString(title) ? title : t`Untitled`}
        />
      </StyledTopBar>
      <StyledContent>
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
            <StyledMessageCard
              backgroundColor={themeCssVariables.background.secondary}
            >
              <StyledMessageFirstLine>
                {firstMessageLine}
              </StyledMessageFirstLine>
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
      </StyledContent>
    </StyledPanel>
  );
};
