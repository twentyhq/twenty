import styled from '@emotion/styled';

import { IconX } from '@/ui/display/icon';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';

import CoverImage from '../assets/build-your-business-logic.jpg';

const StyledCoverImageContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  height: 153px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledCoverImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledLighIconButton = styled(LightIconButton)`
  position: absolute;
  right: ${({ theme }) => theme.spacing(2)};
  top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsObjectCoverImage = () => {
  return (
    <StyledCoverImageContainer>
      <StyledCoverImage src={CoverImage} alt="Build your business logic" />
      <StyledLighIconButton Icon={IconX} accent="tertiary" size="small" />
    </StyledCoverImageContainer>
  );
};
