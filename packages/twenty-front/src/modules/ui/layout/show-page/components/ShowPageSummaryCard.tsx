import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ChangeEvent, ReactNode, useRef } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { AppTooltip, Avatar, AvatarType } from 'twenty-ui';
import { v4 as uuidV4 } from 'uuid';

import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';
import { isDefined } from '~/utils/isDefined';

type ShowPageSummaryCardProps = {
  avatarPlaceholder: string;
  avatarType: AvatarType;
  date: string;
  id?: string;
  logoOrAvatar?: string;
  onUploadPicture?: (file: File) => void;
  title: ReactNode;
  loading: boolean;
  isCompact: boolean;
};

export const StyledShowPageSummaryCard = styled.div<{ isCompact: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: ${({ isCompact }) => (isCompact ? 'row' : 'column')};
  gap: ${({ theme, isCompact }) =>
    isCompact ? theme.spacing(2) : theme.spacing(3)};
  justify-content: ${({ isCompact }) => (isCompact ? 'flex-start' : 'center')};
  padding: ${({ theme }) => theme.spacing(4)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  height: ${({ isCompact }) => (isCompact ? '77px' : '127px')};
  box-sizing: border-box;
`;

const StyledInfoContainer = styled.div<{ isCompact: boolean }>`
  align-items: ${({ isCompact }) => (isCompact ? 'flex-start' : 'center')};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledDate = styled.div<{ isCompact: boolean }>`
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  padding-left: ${({ theme, isCompact }) => (isCompact ? theme.spacing(2) : 0)};
`;

const StyledTitle = styled.div<{ isCompact: boolean }>`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  justify-content: ${({ isCompact }) => (isCompact ? 'flex-start' : 'center')};
  width: ${({ isCompact }) => (isCompact ? '' : '100%')};
`;

const StyledAvatarWrapper = styled.div`
  cursor: pointer;
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
      <Skeleton width={40} height={40} />
      <StyledSubSkeleton>
        <Skeleton width={96} height={16} />
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
  onUploadPicture,
  title,
  loading,
  isCompact = false,
}: ShowPageSummaryCardProps) => {
  const beautifiedCreatedAt =
    date !== '' ? beautifyPastDateRelativeToNow(date) : '';
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
      <StyledShowPageSummaryCard isCompact={isCompact}>
        <StyledShowPageSummaryCardSkeletonLoader />
      </StyledShowPageSummaryCard>
    );

  return (
    <StyledShowPageSummaryCard isCompact={isCompact}>
      <StyledAvatarWrapper>
        <Avatar
          avatarUrl={logoOrAvatar}
          onClick={onUploadPicture ? handleAvatarClick : undefined}
          size="xl"
          placeholderColorSeed={id}
          placeholder={avatarPlaceholder}
          type={avatarType}
        />
        <StyledFileInput
          ref={inputFileRef}
          onChange={onFileChange}
          type="file"
        />
      </StyledAvatarWrapper>
      <StyledInfoContainer isCompact={isCompact}>
        <StyledTitle isCompact={isCompact}>{title}</StyledTitle>
        {beautifiedCreatedAt && (
          <StyledDate isCompact={isCompact} id={dateElementId}>
            Added {beautifiedCreatedAt}
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
