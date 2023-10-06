import { ChangeEvent, useRef } from 'react';
import { Tooltip } from 'react-tooltip';
import styled from '@emotion/styled';
import { v4 as uuidV4 } from 'uuid';

import { Avatar, AvatarType } from '@/users/components/Avatar';
import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';

import { OverflowingTextWithTooltip } from '../../../tooltip/OverflowingTextWithTooltip';

type OwnProps = {
  id?: string;
  logoOrAvatar?: string;
  title: string;
  date: string;
  renderTitleEditComponent?: () => JSX.Element;
  onUploadPicture?: (file: File) => void;
  avatarType: AvatarType;
};

const StyledShowPageSummaryCard = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(3)}
    ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(3)};
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
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  justify-content: center;
  width: 100%;
`;

const StyledTooltip = styled(Tooltip)`
  background-color: ${({ theme }) => theme.background.primary};
  box-shadow: ${({ theme }) => theme.boxShadow.light};

  color: ${({ theme }) => theme.font.color.primary};

  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledAvatarWrapper = styled.div`
  cursor: pointer;
`;

const StyledFileInput = styled.input`
  display: none;
`;

export const ShowPageSummaryCard = ({
  id,
  logoOrAvatar,
  title,
  date,
  avatarType,
  renderTitleEditComponent,
  onUploadPicture,
}: OwnProps) => {
  const beautifiedCreatedAt =
    date !== '' ? beautifyPastDateRelativeToNow(date) : '';
  const exactCreatedAt = date !== '' ? beautifyExactDateTime(date) : '';
  const dateElementId = `date-id-${uuidV4()}`;
  const inputFileRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onUploadPicture?.(e.target.files[0]);
  };
  const handleAvatarClick = () => {
    inputFileRef?.current?.click?.();
  };

  return (
    <StyledShowPageSummaryCard>
      <StyledAvatarWrapper>
        <Avatar
          avatarUrl={logoOrAvatar}
          onClick={onUploadPicture ? handleAvatarClick : undefined}
          size="xl"
          colorId={id}
          placeholder={title}
          type={avatarType}
        />
        <StyledFileInput
          ref={inputFileRef}
          onChange={onFileChange}
          type="file"
        />
      </StyledAvatarWrapper>

      <StyledInfoContainer>
        <StyledTitle>
          {renderTitleEditComponent ? (
            renderTitleEditComponent()
          ) : (
            <OverflowingTextWithTooltip text={title} />
          )}
        </StyledTitle>
        <StyledDate id={dateElementId}>Added {beautifiedCreatedAt}</StyledDate>
        <StyledTooltip
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
