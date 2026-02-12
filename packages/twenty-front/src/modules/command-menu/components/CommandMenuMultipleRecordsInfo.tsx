import { DEFAULT_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/constants/DefaultRecordActionsConfig';
import { MultipleRecordsActionKeys } from '@/action-menu/actions/record-actions/multiple-records/types/MultipleRecordsActionKeys';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';

type CommandMenuMultipleRecordsInfoProps = {
  commandMenuPageInstanceId: string;
};

export const CommandMenuMultipleRecordsInfo = ({
  commandMenuPageInstanceId,
}: CommandMenuMultipleRecordsInfoProps) => {
  const theme = useTheme();

  const { totalCount } = useFindManyRecordsSelectedInContextStore({
    instanceId: commandMenuPageInstanceId,
    limit: 1,
  });

  const { Icon, label } =
    DEFAULT_RECORD_ACTIONS_CONFIG[MultipleRecordsActionKeys.UPDATE];

  return (
    <CommandMenuPageInfoLayout
      icon={<Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />}
      iconColor={theme.font.color.tertiary}
      title={getActionLabel(label)}
      label={t`${totalCount} selected`}
    />
  );
};
