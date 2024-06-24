import { ChangeEvent, ReactNode, useRef } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
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
};

export const StyledShowPageSummaryCard = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  height: 127px;
`;

const StyledInfoContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledDate = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
`;

const StyledTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  justify-content: center;
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
      <StyledShowPageSummaryCard>
        <StyledShowPageSummaryCardSkeletonLoader />
      </StyledShowPageSummaryCard>
    );

  return (
    <StyledShowPageSummaryCard>
      <StyledAvatarWrapper>
        <Avatar
          avatarUrl={logoOrAvatar}
          onClick={onUploadPicture ? handleAvatarClick : undefined}
          size="xl"
          entityId={id}
          placeholder={avatarPlaceholder}
          type={avatarType}
        />
        <StyledFileInput
          ref={inputFileRef}
          onChange={onFileChange}
          type="file"
        />
      </StyledAvatarWrapper>
      <StyledInfoContainer>
        <StyledTitle>{title}</StyledTitle>
        {beautifiedCreatedAt && (
          <StyledDate id={dateElementId}>
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
