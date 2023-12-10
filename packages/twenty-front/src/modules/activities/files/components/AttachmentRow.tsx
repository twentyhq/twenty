import { useMemo } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { AttachmentDropdown } from '@/activities/files/components/AttachmentDropdown';
import { AttachmentIcon } from '@/activities/files/components/AttachmentIcon';
import { Attachment } from '@/activities/files/types/Attachment';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import {
  FieldContext,
  GenericFieldContextType,
} from '@/object-record/field/contexts/FieldContext';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { IconCalendar } from '@/ui/display/icon';
import { formatToHumanReadableDate } from '~/utils';

const StyledRow = styled.div`
  align-items: center;
  align-self: stretch;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  justify-content: space-between;

  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledLeftContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledRightContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledCalendarIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
`;

const StyledLink = styled.a`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  text-decoration: none;
  :hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

export const AttachmentRow = ({ attachment }: { attachment: Attachment }) => {
  const theme = useTheme();
  const fieldContext = useMemo(
    () => ({ recoilScopeId: attachment?.id ?? '' }),
    [attachment?.id],
  );

  const { deleteOneRecord: deleteOneAttachment } =
    useDeleteOneRecord<Attachment>({
      objectNameSingular: 'attachment',
    });

  const handleDelete = () => {
    deleteOneAttachment(attachment.id);
  };

  return (
    <FieldContext.Provider value={fieldContext as GenericFieldContextType}>
      <StyledRow>
        <StyledLeftContent>
          <AttachmentIcon attachment={attachment} />
          <StyledLink
            href={
              process.env.REACT_APP_SERVER_BASE_URL +
              '/files/' +
              attachment.fullPath
            }
            target="__blank"
          >
            {attachment.name}
          </StyledLink>
        </StyledLeftContent>
        <StyledRightContent>
          <StyledCalendarIconContainer>
            <IconCalendar size={theme.icon.size.md} />
          </StyledCalendarIconContainer>
          {formatToHumanReadableDate(attachment.createdAt)}
          <AttachmentDropdown
            scopeKey={attachment.id}
            onDelete={handleDelete}
            onDownload={() => {
              downloadFile(attachment.fullPath, attachment.name);
            }}
          />
        </StyledRightContent>
      </StyledRow>
    </FieldContext.Provider>
  );
};
