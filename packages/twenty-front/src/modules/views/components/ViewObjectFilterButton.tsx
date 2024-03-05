import { useSearchParams } from 'react-router-dom';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { IconList, IconX } from '@/ui/display/icon/index';
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/MobileViewport';
import { useViewScopedStates } from '@/views/hooks/internal/useViewScopedStates';

const StyledViewIcon = styled(IconList)`
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledObjectFilterButtonContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledViewName = styled.span`
  display: inline-block;
  max-width: 130px;
  @media (max-width: 375px) {
    max-width: 90px;
  }
  @media (min-width: 376px) and (max-width: ${MOBILE_VIEWPORT}px) {
    max-width: 110px;
  }
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
`;

const StyledDelete = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-left: ${({ theme }) => theme.spacing(2)};
  margin-top: 1px;
  user-select: none;
  &:hover {
    background-color: ${({ theme }) => theme.background.tertiary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

const StyledDeleteLabelAdornment = styled.span`
  white-space: pre-wrap;
`;

export const ViewObjectFilterButton = () => {
  const theme = useTheme();
  const [_, setSearchParams] = useSearchParams();
  const { currentViewSelector, entityCountInCurrentViewState } =
    useViewScopedStates();
  const currentView = useRecoilValue(currentViewSelector);
  const entityCountInCurrentView = useRecoilValue(
    entityCountInCurrentViewState,
  );

  const handleRemoveObjectFilter = () => {
    setSearchParams({}, { replace: true });
  };

  return (
    <StyledObjectFilterButtonContainer>
      <StyledViewIcon size={theme.icon.size.md} />
      <StyledViewName>{currentView?.name ?? 'All'}</StyledViewName>
      <StyledDeleteLabelAdornment>
        {' '}
        · {entityCountInCurrentView}
      </StyledDeleteLabelAdornment>
      <StyledDelete onClick={handleRemoveObjectFilter}>
        <IconX size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      </StyledDelete>
    </StyledObjectFilterButtonContainer>
  );
};
