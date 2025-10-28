import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { type ChangeEvent, type ReactNode, useRef } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  Avatar,
  type AvatarType,
  type IconComponent,
} from 'twenty-ui/display';
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
  display: flex;
  flex-direction: ${({ isMobile }) => (isMobile ? 'row' : 'column')};
  gap: ${({ theme, isMobile }) =>
    isMobile ? theme.spacing(2) : theme.spacing(3)};
  justify-content: ${({ isMobile }) => (isMobile ? 'flex-start' : 'center')};
  padding: ${({ theme }) => theme.spacing(4)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  height: ${({ isMobile }) => (isMobile ? '77px' : '127px')};
  box-sizing: border-box;
`;

const StyledInfoContainer = styled.div<{ isMobile: boolean }>`
  align-items: ${({ isMobile }) => (isMobile ? 'flex-start' : 'center')};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledDate = styled.div<{ isMobile: boolean }>`
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledTitle = styled.div<{ isMobile: boolean }>`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  justify-content: ${({ isMobile }) => (isMobile ? 'flex-start' : 'center')};
  width: 90%;
`;

const StyledAvatarWrapper = styled.div<{
  isAvatarEditable: boolean;
  hasIcon: boolean;
}>`
  background-color: ${({ theme, hasIcon }) =>
    hasIcon ? theme.background.transparent.light : 'unset'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
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
  const theme = useTheme();
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
  const { localeCatalog } = useRecoilValue(dateLocaleState);
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
