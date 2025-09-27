import styled from '@emotion/styled';
import {
  Banner,
  IconX
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ImpersonationBanner = ({
  message,
  buttonOnClick,
}: {
  message: string;
  buttonOnClick?: () => void;
}) => {
  return (
    <Banner variant="default">
      <StyledText>{message}</StyledText>
      {buttonOnClick && (
        <Button
          variant="secondary"
          title="Stop impersonating"
          Icon={IconX}
          size="small"
          onClick={buttonOnClick}
          inverted
        />
      )}
    </Banner>
  );
};
