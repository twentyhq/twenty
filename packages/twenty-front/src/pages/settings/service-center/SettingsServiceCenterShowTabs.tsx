import styled from '@emotion/styled';
import { useEffect } from 'react';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { ServiceCenterTabContent } from '@/settings/service-center/telephony/components/SettingsServiceCenterTabContent';
import { useFindAllTelephonys } from '../../../modules/settings/service-center/telephony/hooks/useFindAllTelephony';

const StyledShowServiceCenterTabs = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: start;
  width: 100%;
`;

export const TAB_LIST_COMPONENT_ID = 'show-page-right-tab-list';

type ShowServiceCenterTelephonyTabsProps = {
  isRightDrawer?: boolean;
  loading?: boolean;
};

export const ShowServiceCenterTelephonyTabs = ({
  isRightDrawer = false,
}: ShowServiceCenterTelephonyTabsProps) => {
  const isMobile = useIsMobile() || isRightDrawer;
  const { telephonys, refetch } = useFindAllTelephonys();

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const [allExtensions, setAllExtensions] = useState([]);

  return (
    <>
      <StyledShowServiceCenterTabs isMobile={isMobile}>
        <ServiceCenterTabContent telephonys={telephonys} refetch={refetch} />
      </StyledShowServiceCenterTabs>
    </>
  );
};
