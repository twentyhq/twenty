import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';

import { grayScale } from '@/ui/theme/constants/colors';

type EmailThreadFetchMoreLoaderProps = {
  loading: boolean;
  onLastRowVisible: (...args: any[]) => any;
};

const StyledText = styled.div`
  align-items: center;
  box-shadow: none;
  color: ${grayScale.gray40};
  display: flex;
  height: 32px;
  margin-left: ${({ theme }) => theme.spacing(8)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

export const EmailThreadFetchMoreLoader = ({
  loading,
  onLastRowVisible,
}: EmailThreadFetchMoreLoaderProps) => {
  const { ref: tbodyRef } = useInView({
    onChange: onLastRowVisible,
  });

  return (
    <div ref={tbodyRef}>
      {loading && <StyledText>Loading more...</StyledText>}
    </div>
  );
};
