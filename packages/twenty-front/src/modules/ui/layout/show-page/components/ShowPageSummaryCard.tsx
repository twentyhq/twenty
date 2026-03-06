import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { type ChangeEvent, type ReactNode, useContext, useRef } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  Avatar,
  type AvatarType,
  type IconComponent,
} from 'twenty-ui/display';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { v4 as uuidV4 } from 'uuid';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';

type ShowPageSummaryCardProps = {
  avatarPlaceholder: string;
  avatarType: AvatarType;
  date: string;
  id?: string;
  logoOrAvatar?: string;
  icon?: IconComponent;
  iconColor?: string;
  onUploadPicture?: (file: File) => void;
  title: ReactNode;
  loading: boolean;
  isMobile?: boolean;
};

export const StyledShowPageSummaryCard = styled.div<{
  isMobile: boolean;
}>`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-direction: ${({ isMobile }) => (isMobile ? 'row' : 'column')};
  gap: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[2] : themeCssVariables.spacing[3]};
  height: ${({ isMobile }) => (isMobile ? '77px' : '127px')};
  justify-content: ${({ isMobile }) => (isMobile ? 'flex-start' : 'center')};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledInfoContainer = styled.div<{ isMobile: boolean }>`
  align-items: ${({ isMobile }) => (isMobile ? 'flex-start' : 'center')};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledDate = styled.div<{ isMobile: boolean }>`
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledTitle = styled.div<{ isMobile: boolean }>`
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  justify-content: ${({ isMobile }) => (isMobile ? 'flex-start' : 'center')};
  width: 90%;
`;

const StyledAvatarWrapper = styled.div<{
  isAvatarEditable: boolean;
  hasIcon: boolean;
}>`
  background-color: ${({ hasIcon }) =>
    hasIcon ? themeCssVariables.background.transparent.light : 'unset'};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: ${({ isAvatarEditable }) =>
    isAvatarEditable ? 'pointer' : 'default'};
`;

const StyledFileInput = styled.input`
  display: none;
`;

const StyledSubSkeleton = styled.div`
  align-items: center;
  display: flex;
  height: 37px;
  justify-content: center;
  width: 108px;
`;

const StyledShowPageSummaryCardSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <Skeleton width={40} height={SKELETON_LOADER_HEIGHT_SIZES.standard.xl} />
      <StyledSubSkeleton>
        <Skeleton width={96} height={SKELETON_LOADER_HEIGHT_SIZES.standard.s} />
      </StyledSubSkeleton>
    </SkeletonTheme>
  );
};

export const ShowPageSummaryCard = ({
  avatarPlaceholder,
  avatarType,
  date,
  id,
  logoOrAvatar,
  icon,
  iconColor,
  onUploadPicture,
  title,
  loading,
  isMobile = false,
}: ShowPageSummaryCardProps) => {
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const beautifiedCreatedAt =
    date !== '' ? beautifyPastDateRelativeToNow(date, localeCatalog) : '';
  const exactCreatedAt = date !== '' ? beautifyExactDateTime(date) : '';
  const dateElementId = `date-id-${uuidV4()}`;
  const inputFileRef = useRef<HTMLInputElement>(null);
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (isDefined(e.target.files)) onUploadPicture?.(e.target.files[0]);
  };

  const handleAvatarClick = () => {
    inputFileRef?.current?.click?.();
  };

  if (loading)
    return (
      <StyledShowPageSummaryCard isMobile={isMobile}>
        <StyledShowPageSummaryCardSkeletonLoader />
      </StyledShowPageSummaryCard>
    );

  return (
    <StyledShowPageSummaryCard isMobile={isMobile}>
      <StyledAvatarWrapper
        isAvatarEditable={isDefined(onUploadPicture)}
        hasIcon={isDefined(icon)}
      >
        <Avatar
          avatarUrl={logoOrAvatar}
          onClick={onUploadPicture ? handleAvatarClick : undefined}
          size="xl"
          placeholderColorSeed={id}
          placeholder={avatarPlaceholder}
          type={icon ? 'icon' : avatarType}
          Icon={icon}
          iconColor={iconColor}
        />
        <StyledFileInput
          ref={inputFileRef}
          onChange={onFileChange}
          type="file"
        />
      </StyledAvatarWrapper>
      <StyledInfoContainer isMobile={isMobile}>
        <StyledTitle isMobile={isMobile}>{title}</StyledTitle>
        {beautifiedCreatedAt && (
          <StyledDate isMobile={isMobile} id={dateElementId}>
            <Trans>Added {beautifiedCreatedAt}</Trans>
          </StyledDate>
        )}
        <AppTooltip
          anchorSelect={`#${dateElementId}`}
          content={exactCreatedAt}
          clickable
          noArrow
          place="right"
        />
      </StyledInfoContainer>
    </StyledShowPageSummaryCard>
  );
};
