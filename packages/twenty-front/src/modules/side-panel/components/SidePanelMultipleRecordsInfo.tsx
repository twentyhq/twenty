import { DEFAULT_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/DefaultRecordActionsConfig';
import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
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
    DEFAULT_RECORD_ACTIONS_CONFIG[MultipleRecordsActionKeys.UPDATE];

  return (
    <SidePanelPageInfoLayout
      icon={<Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />}
      iconColor={theme.font.color.tertiary}
      title={getActionLabel(label)}
      label={t`${totalCount} selected`}
    />
  );
};
