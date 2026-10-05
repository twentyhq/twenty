import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { t } from '@lingui/core/macro';
import { IconPencil } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

type SidePanelMultipleRecordsInfoProps = {
  sidePanelPageInstanceId: string;
};

export const SidePanelMultipleRecordsInfo = ({
  sidePanelPageInstanceId,
}: SidePanelMultipleRecordsInfoProps) => {
  const theme = useTheme();
  const { formatNumber } = useNumberFormat();
  const { totalCount } = useFindManyRecordsSelectedInContextStore({
    instanceId: sidePanelPageInstanceId,
    limit: 1,
  });

  return (
    <HeaderIdentifier
      icon={
        <IconPencil size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      }
      iconColor={theme.font.color.tertiary}
      title={t`Update records`}
      label={t`${formatNumber(totalCount ?? 0)} selected`}
    />
  );
};
