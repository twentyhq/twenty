import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';

import { grayScale } from '@/ui/theme/constants/colors';

type FetchMoreLoaderProps = {
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

export const FetchMoreLoader = ({
  loading,
  onLastRowVisible,
}: FetchMoreLoaderProps) => {
  const { ref: tbodyRef } = useInView({
    onChange: onLastRowVisible,
  });

  return (
    <tbody ref={tbodyRef}>
      {loading && (
        <tr>
          <td colSpan={7}>
            <StyledText>Loading more...</StyledText>
          </td>
          <td colSpan={7} />
        </tr>
      )}
    </tbody>
  );
};
