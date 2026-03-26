import { CoachingCustomerDetail } from '@/coaching/components/CoachingCustomerDetail';
import { CoachingEmptyDetail } from '@/coaching/components/CoachingEmptyDetail';
import styled from '@emotion/styled';

type CoachingRightPanelProps = {
  selectedCustomerId: string | null;
};

const StyledRightPanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  overflow: hidden;
`;

export const CoachingRightPanel = ({
  selectedCustomerId,
}: CoachingRightPanelProps) => {
  if (!selectedCustomerId) {
    return (
      <StyledRightPanel>
        <CoachingEmptyDetail />
      </StyledRightPanel>
    );
  }

  return (
    <StyledRightPanel>
      <CoachingCustomerDetail customerId={selectedCustomerId} />
    </StyledRightPanel>
  );
};
