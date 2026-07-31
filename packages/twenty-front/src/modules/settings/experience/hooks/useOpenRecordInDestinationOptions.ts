import { useLingui } from '@lingui/react/macro';
import { IconLayoutNavbar, IconLayoutSidebarRight } from 'twenty-ui/icon';

export const useOpenRecordInDestinationOptions = <TValue>({
  sidePanelValue,
  recordPageValue,
}: {
  sidePanelValue: TValue;
  recordPageValue: TValue;
}) => {
  const { t } = useLingui();

  return [
    {
      label: t`Side Panel`,
      value: sidePanelValue,
      Icon: IconLayoutSidebarRight,
    },
    {
      label: t`Record Page`,
      value: recordPageValue,
      Icon: IconLayoutNavbar,
    },
  ];
};
