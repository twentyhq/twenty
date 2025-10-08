import styled from '@emotion/styled';
import { useState } from 'react';

import { SkeletonLoader } from '@/activities/components/SkeletonLoader';
import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { type Attachment } from '@/activities/files/types/Attachment';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { FileIcon } from '@/file/components/FileIcon';
import { Trans, useLingui } from '@lingui/react/macro';
import { IconX, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  EMPTY_PLACEHOLDER_TRANSITION_PROPS,
} from 'twenty-ui/layout';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(2)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
`;

const StyledTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
`;

const StyledCloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledAttachmentRowWrapper = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
  
  ${({ isSelected, theme }) =>
    isSelected &&
    `
    background: ${theme.background.transparent.medium};
  `}
`;

const StyledFileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  flex: 1;
  min-width: 0;
`;

const StyledFileName = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledSearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-size: ${({ theme }) => theme.font.size.sm};
  outline: none;
  
  &:focus {
    border-color: ${({ theme }) => theme.border.color.strong};
  }
`;

type AttachmentSelectorProps = {
  targetableObject: ActivityTargetableObject;
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onClose: () => void;
  filterAttachment?: (attachment: Attachment) => boolean;
  title?: string;
};

export const AttachmentSelector = ({
  targetableObject,
  selectedIds,
  onSelectionChange,
  onClose,
  filterAttachment,
  title,
}: AttachmentSelectorProps) => {
  const { t } = useLingui();
  const [searchQuery, setSearchQuery] = useState('');

  // Guard: If targetObjectNameSingular is missing/empty, don't fetch attachments
  const shouldFetchAttachments =
    targetableObject.targetObjectNameSingular &&
    targetableObject.targetObjectNameSingular.trim() !== '';

  const attachmentsQuery = useAttachments(
    shouldFetchAttachments ? targetableObject : undefined,
  );

  const attachments = shouldFetchAttachments
    ? attachmentsQuery.attachments
    : [];
  const loading = shouldFetchAttachments
    ? attachmentsQuery.loading
    : false;

  const filteredAttachments = (attachments || []).filter((attachment) => {
    // Apply custom attachment filter if provided
    if (filterAttachment && !filterAttachment(attachment)) {
      return false;
    }

    // Apply search filter
    if (
      searchQuery &&
      !attachment.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const toggleSelection = (attachmentId: string) => {
    if (selectedIds.includes(attachmentId)) {
      onSelectionChange(selectedIds.filter((id) => id !== attachmentId));
    } else {
      onSelectionChange([...selectedIds, attachmentId]);
    }
  };

  if (loading && !attachments?.length) {
    return <SkeletonLoader />;
  }

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledTitle>{title || t`Select Attachments`}</StyledTitle>
        <StyledCloseButton onClick={onClose}>
          <IconX />
        </StyledCloseButton>
      </StyledHeader>

      <div style={{ padding: '0 16px' }}>
        <StyledSearchInput
          type="text"
          placeholder={t`Search attachments...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <StyledListContainer>
        {filteredAttachments.length === 0 ? (
          <AnimatedPlaceholderEmptyContainer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...EMPTY_PLACEHOLDER_TRANSITION_PROPS}
          >
            <AnimatedPlaceholder type="noFile" />
            <AnimatedPlaceholderEmptyTextContainer>
              <AnimatedPlaceholderEmptyTitle>
                <Trans>No Attachments</Trans>
              </AnimatedPlaceholderEmptyTitle>
              <AnimatedPlaceholderEmptySubTitle>
                <Trans>No matching attachments found.</Trans>
              </AnimatedPlaceholderEmptySubTitle>
            </AnimatedPlaceholderEmptyTextContainer>
          </AnimatedPlaceholderEmptyContainer>
        ) : (
          filteredAttachments.map((attachment) => {
            const isSelected = selectedIds.includes(attachment.id);
            return (
              <StyledAttachmentRowWrapper
                key={attachment.id}
                isSelected={isSelected}
                onClick={() => toggleSelection(attachment.id)}
              >
                <Checkbox checked={isSelected} onChange={() => {}} />
                <StyledFileInfo>
                  <FileIcon fileType={attachment.type} />
                  <StyledFileName>
                    <OverflowingTextWithTooltip text={attachment.name} />
                  </StyledFileName>
                </StyledFileInfo>
              </StyledAttachmentRowWrapper>
            );
          })
        )}
      </StyledListContainer>
    </StyledContainer>
  );
};

