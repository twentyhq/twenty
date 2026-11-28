import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString, isString } from '@sniptt/guards';
import { formatInTimeZone } from 'date-fns-tz';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { IconButton } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { IconId, IconLayoutSidebarRightCollapse } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { LOG_CONSOLE_NARROW_BODY_MAX_WIDTH } from '@/log-console/constants/LogConsoleNarrowBodyMaxWidth';
import { useLogConsoleTimeZone } from '@/log-console/hooks/useLogConsoleTimeZone';
import { logConsoleSelectedLogState } from '@/log-console/states/logConsoleSelectedLogState';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { APP_HEADER_HEIGHT } from '@/ui/layout/constants/AppHeaderHeight';
import { DetailFieldRow } from '@/ui/layout/details/components/DetailFieldRow';
import { DetailFieldsCard } from '@/ui/layout/details/components/DetailFieldsCard';
import { DetailMessageCard } from '@/ui/layout/details/components/DetailMessageCard';
import { JsonSection } from '@/ui/layout/details/components/JsonSection';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledPanel = styled.aside`
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

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
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledCopyableId = styled.div`
  cursor: pointer;
  min-width: 0;
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

  const DetailIcon = source.getDetailIcon?.(entry) ?? source.Icon;

  const title = isDefined(recordIdentifier)
    ? recordIdentifier.name
    : source.getDetailTitle(entry, { objectMetadataItem });

  const timeWithMillisecondsFormat = doNotTranslate(
    timeFormat === TimeFormat.HOUR_12 ? 'h:mm:ss.SSS aa' : 'HH:mm:ss.SSS',
  );

  const formattedTimestamp = formatInTimeZone(
    entry.timestamp,
    timeZone,
    `${timeWithMillisecondsFormat} · ${dateFormat}`,
    { locale: localeCatalog },
  );

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
          <DetailMessageCard
            key={`${entry.timestamp}-${entry.event}`}
            title={t`Message`}
            message={message}
          />
        )}
        {source.renderDetailContent?.(entry)}
        <Section.Root>
          <Section.Header title={t`Details`} />
          <DetailFieldsCard>
            {detailItems.map(({ Icon, label, value }) => (
              <DetailFieldRow key={label} Icon={Icon} label={label}>
                {value}
              </DetailFieldRow>
            ))}
          </DetailFieldsCard>
        </Section.Root>
        <JsonSection title={t`Raw event`} value={rawEvent} />
      </StyledContent>
    </StyledPanel>
  );
};
