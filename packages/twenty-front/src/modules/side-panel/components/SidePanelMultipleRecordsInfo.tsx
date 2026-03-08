import { DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG } from '@/command-menu-item/record/constants/DefaultRecordCommandMenuItemsConfig';
import { MultipleRecordsCommandKeys } from '@/command-menu-item/record/multiple-records/types/MultipleRecordsCommandKeys';
import { getCommandMenuItemLabel } from '@/command-menu-item/utils/getCommandMenuItemLabel';
import { SidePanelPageInfoLayout } from '@/side-panel/components/SidePanelPageInfoLayout';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

type SidePanelMultipleRecordsInfoProps = {
  sidePanelPageInstanceId: string;
};

export const SidePanelMultipleRecordsInfo = ({
  sidePanelPageInstanceId,
}: SidePanelMultipleRecordsInfoProps) => {
  const { theme } = useContext(ThemeContext);
  const { totalCount } = useFindManyRecordsSelectedInContextStore({
    instanceId: sidePanelPageInstanceId,
    limit: 1,
  });

  const { Icon, label } =
    DEFAULT_RECORD_COMMAND_MENU_ITEMS_CONFIG[MultipleRecordsCommandKeys.UPDATE];

  return (
    <SidePanelPageInfoLayout
      icon={<Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />}
      iconColor={theme.font.color.tertiary}
      title={getCommandMenuItemLabel(label)}
      label={t`${totalCount} selected`}
    />
  );
};
