import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Pill } from 'twenty-ui/components';

const StyledPill = styled(Pill)`
  background: ${({ theme }) => theme.color.blue3};
  border: 1px solid ${({ theme }) => theme.color.blue5};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ theme }) => theme.color.blue};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  position: absolute;
  right: -${({ theme }) => theme.spacing(5)};
  top: -${({ theme }) => theme.spacing(2)};
`;

export const LastUsedPill = () => {
  const { t } = useLingui();

  return (
    <StyledPill
      label={t({
        message: 'Last',
        comment:
          'Short label (keep brief) indicating the most recently used login method',
      })}
    />
  );
};
