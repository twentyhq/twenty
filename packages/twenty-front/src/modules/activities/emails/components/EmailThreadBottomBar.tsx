import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconArrowBackUp, IconUserCircle } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

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
        title={t`Reply`}
        variant="secondary"
        accent="default"
      />
      <Button
        Icon={IconArrowBackUp}
        title={t`Reply to all`}
        variant="secondary"
        accent="default"
      />
      <Button
        Icon={IconUserCircle}
        title={t`Share`}
        variant="secondary"
        accent="default"
      />
    </StyledThreadBottomBar>
  );
};
