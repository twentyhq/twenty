import { SidePanelPageInfoLayout } from '@/side-panel/components/SidePanelPageInfoLayout';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconPencil } from 'twenty-ui/display';
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

  return (
    <SidePanelPageInfoLayout
      icon={
        <IconPencil size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
      }
      iconColor={theme.font.color.tertiary}
      title={t`Update records`}
      label={t`${totalCount} selected`}
    />
  );
};
