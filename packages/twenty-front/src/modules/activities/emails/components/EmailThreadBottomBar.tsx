import styled from '@emotion/styled';
import { Button, IconArrowBackUp, IconUserCircle } from 'twenty-ui';

const StyledThreadBottomBar = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(6)};
  padding-right: ${({ theme }) => theme.spacing(6)};
  padding-top: ${({ theme }) => theme.spacing(4)};
`;

export const ThreadBottomBar = () => {
  return (
    <StyledThreadBottomBar>
      <Button
        Icon={IconArrowBackUp}
        title="Reply"
        variant="secondary"
        accent="default"
      />
      <Button
        Icon={IconArrowBackUp}
        title="Reply to all"
        variant="secondary"
        accent="default"
      />
      <Button
        Icon={IconUserCircle}
        title="Share"
        variant="secondary"
        accent="default"
      />
    </StyledThreadBottomBar>
  );
};
