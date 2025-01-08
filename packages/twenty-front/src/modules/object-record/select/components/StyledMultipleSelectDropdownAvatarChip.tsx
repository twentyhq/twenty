import styled from '@emotion/styled';
import { AvatarChip } from 'twenty-ui';

export const StyledMultipleSelectDropdownAvatarChip = styled(AvatarChip)`
  &.avatar-icon-container {
    color: ${({ theme }) => theme.font.color.secondary};
    gap: ${({ theme }) => theme.spacing(2)};
    padding-left: 0px;
    padding-right: 0px;
    font-size: ${({ theme }) => theme.font.size.md};
  }
`;
