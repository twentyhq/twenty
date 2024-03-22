import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';

import { GRAY_SCALE } from '@/ui/theme/constants/GrayScale';

type CalendarEventFetchMoreLoaderProps = {
  loading: boolean;
  onLastRowVisible: (...args: any[]) => any;
};

const StyledText = styled.div`
  align-items: center;
  box-shadow: none;
  color: ${GRAY_SCALE.gray40};
  display: flex;
  height: 32px;
  margin-left: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

export const CalendarEventFetchMoreLoader = ({
  loading,
  onLastRowVisible,
}: CalendarEventFetchMoreLoaderProps) => {
  const { ref: tbodyRef } = useInView({
    onChange: onLastRowVisible,
  });

  return (
    <div ref={tbodyRef}>
      {loading && <StyledText>Loading more...</StyledText>}
    </div>
  );
};
