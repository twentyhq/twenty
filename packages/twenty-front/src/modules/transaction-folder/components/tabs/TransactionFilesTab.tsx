import styled from '@emotion/styled';
import { useState } from 'react';
import {
    IconCheck,
    IconClock,
    IconDownload,
    IconEye,
    IconFile,
    IconFolder,
    IconPencil,
    IconSignature,
    IconTrash,
    IconUpload,
} from 'twenty-ui/display';

const StyledFilesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledToolbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  border: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledToolbarLeft = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid
    ${({ theme, variant }) =>
      variant === 'primary' ? 'transparent' : theme.border.color.medium};
  background: ${({ theme, variant }) =>
    variant === 'primary' ? theme.color.blue : theme.background.primary};
  color: ${({ theme, variant }) =>
    variant === 'primary' ? 'white' : theme.font.color.primary};

  &:hover {
    background: ${({ theme, variant }) =>
      variant === 'primary' ? theme.color.blue50 : theme.background.tertiary};
  }
`;

const StyledFolderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFolderHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

const StyledFolderIcon = styled.div`
  color: ${({ theme }) => theme.color.blue};
`;

const StyledFolderName = styled.span`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledFileCount = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledFileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(6)};
`;

const StyledFileRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.border.color.medium};
    box-shadow: ${({ theme }) => theme.boxShadow.light};
  }
`;

const StyledFileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledFileIcon = styled.div<{ fileType?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background: ${({ theme, fileType }) => {
    switch (fileType) {
      case 'pdf':
        return theme.color.red10;
      case 'doc':
        return theme.color.blue10;
      case 'image':
        return theme.color.green10;
      default:
        return theme.background.tertiary;
    }
  }};
  color: ${({ theme, fileType }) => {
    switch (fileType) {
      case 'pdf':
        return theme.color.red;
      case 'doc':
        return theme.color.blue;
      case 'image':
        return theme.color.green;
      default:
        return theme.font.color.secondary;
    }
  }};
`;

const StyledFileDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledFileName = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledFileMeta = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledFileStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledStatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  background: ${({ theme, status }) => {
    switch (status) {
      case 'signed':
        return theme.color.green10;
      case 'pending':
        return theme.color.orange10;
      case 'sent':
        return theme.color.blue10;
      case 'uploaded':
        return theme.background.tertiary;
      default:
        return theme.background.tertiary;
    }
  }};
  color: ${({ theme, status }) => {
    switch (status) {
      case 'signed':
        return theme.color.green;
      case 'pending':
        return theme.color.orange;
      case 'sent':
        return theme.color.blue;
      default:
        return theme.font.color.secondary;
    }
  }};
`;

const StyledFileActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.font.color.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(12)};
  gap: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

type TransactionFilesTabProps = {
  transactionId: string;
};

export const TransactionFilesTab = ({
  transactionId,
}: TransactionFilesTabProps) => {
  const [expandedFolders, setExpandedFolders] = useState<string[]>([
    'contracts',
  ]);

  // Mock data - would come from GraphQL query
  const folders = [
    {
      id: 'contracts',
      name: 'Contracts & Addendums',
      files: [
        {
          id: '1',
          name: 'TREC 1-4 Contract.pdf',
          type: 'pdf',
          size: '2.4 MB',
          uploadedAt: '2024-01-15',
          status: 'signed',
          signedBy: ['Buyer', 'Seller'],
        },
        {
          id: '2',
          name: 'Third Party Financing Addendum.pdf',
          type: 'pdf',
          size: '1.2 MB',
          uploadedAt: '2024-01-15',
          status: 'pending',
          signedBy: [],
        },
        {
          id: '3',
          name: 'HOA Addendum.pdf',
          type: 'pdf',
          size: '890 KB',
          uploadedAt: '2024-01-16',
          status: 'sent',
          signedBy: [],
        },
      ],
    },
    {
      id: 'disclosures',
      name: 'Disclosures',
      files: [
        {
          id: '4',
          name: "Seller's Disclosure.pdf",
          type: 'pdf',
          size: '3.1 MB',
          uploadedAt: '2024-01-14',
          status: 'signed',
          signedBy: ['Seller'],
        },
        {
          id: '5',
          name: 'Lead-Based Paint Disclosure.pdf',
          type: 'pdf',
          size: '450 KB',
          uploadedAt: '2024-01-14',
          status: 'signed',
          signedBy: ['Buyer', 'Seller'],
        },
      ],
    },
    {
      id: 'inspections',
      name: 'Inspections',
      files: [
        {
          id: '6',
          name: 'Home Inspection Report.pdf',
          type: 'pdf',
          size: '8.5 MB',
          uploadedAt: '2024-01-18',
          status: 'uploaded',
          signedBy: [],
        },
      ],
    },
    {
      id: 'financing',
      name: 'Financing',
      files: [
        {
          id: '7',
          name: 'Pre-Approval Letter.pdf',
          type: 'pdf',
          size: '560 KB',
          uploadedAt: '2024-01-10',
          status: 'uploaded',
          signedBy: [],
        },
      ],
    },
    {
      id: 'title',
      name: 'Title & Survey',
      files: [],
    },
    {
      id: 'closing',
      name: 'Closing Documents',
      files: [],
    },
  ];

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId],
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return <IconCheck size={12} />;
      case 'pending':
        return <IconClock size={12} />;
      case 'sent':
        return <IconSignature size={12} />;
      default:
        return null;
    }
  };

  return (
    <StyledFilesContainer>
      <StyledToolbar>
        <StyledToolbarLeft>
          <StyledButton variant="primary">
            <IconUpload size={16} />
            Upload File
          </StyledButton>
          <StyledButton>
            <IconFolder size={16} />
            New Folder
          </StyledButton>
        </StyledToolbarLeft>
        <StyledButton>
          <IconDownload size={16} />
          Download All
        </StyledButton>
      </StyledToolbar>

      {folders.map((folder) => (
        <StyledFolderSection key={folder.id}>
          <StyledFolderHeader onClick={() => toggleFolder(folder.id)}>
            <StyledFolderIcon>
              <IconFolder size={20} />
            </StyledFolderIcon>
            <StyledFolderName>{folder.name}</StyledFolderName>
            <StyledFileCount>({folder.files.length} files)</StyledFileCount>
          </StyledFolderHeader>

          {expandedFolders.includes(folder.id) && (
            <StyledFileList>
              {folder.files.length > 0 ? (
                folder.files.map((file) => (
                  <StyledFileRow key={file.id}>
                    <StyledFileInfo>
                      <StyledFileIcon fileType={file.type}>
                        <IconFile size={20} />
                      </StyledFileIcon>
                      <StyledFileDetails>
                        <StyledFileName>{file.name}</StyledFileName>
                        <StyledFileMeta>
                          {file.size} • Uploaded{' '}
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </StyledFileMeta>
                      </StyledFileDetails>
                    </StyledFileInfo>

                    <StyledFileStatus>
                      <StyledStatusBadge status={file.status}>
                        {getStatusIcon(file.status)}
                        {file.status.charAt(0).toUpperCase() +
                          file.status.slice(1)}
                      </StyledStatusBadge>
                      <StyledFileActions>
                        <StyledIconButton title="View">
                          <IconEye size={16} />
                        </StyledIconButton>
                        <StyledIconButton title="Edit">
                          <IconPencil size={16} />
                        </StyledIconButton>
                        <StyledIconButton title="Download">
                          <IconDownload size={16} />
                        </StyledIconButton>
                        <StyledIconButton title="Delete">
                          <IconTrash size={16} />
                        </StyledIconButton>
                      </StyledFileActions>
                    </StyledFileStatus>
                  </StyledFileRow>
                ))
              ) : (
                <StyledEmptyState>
                  <IconFile size={32} />
                  <span>No files in this folder</span>
                  <StyledButton>
                    <IconUpload size={16} />
                    Upload File
                  </StyledButton>
                </StyledEmptyState>
              )}
            </StyledFileList>
          )}
        </StyledFolderSection>
      ))}
    </StyledFilesContainer>
  );
};
