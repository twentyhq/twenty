import styled from '@emotion/styled';
import { useState } from 'react';
import {
  IconFolder,
  IconFile,
  IconUpload,
  IconDownload,
  IconTrash,
  IconEye,
  IconShare,
  IconPlus,
  IconSearch,
  IconFilter,
  IconPdf,
  IconPhoto,
  IconFileSpreadsheet,
  IconFileWord,
} from 'twenty-ui/display';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(6)};
  height: 100%;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledToolbar = styled.div`
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

const StyledSearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

const StyledSearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.primary};

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

const StyledTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTab = styled.button<{ isActive: boolean }>`
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(4)}`};
  border: none;
  background: transparent;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme, isActive }) =>
    isActive ? theme.color.blue : theme.font.color.secondary};
  border-bottom: 2px solid
    ${({ theme, isActive }) => (isActive ? theme.color.blue : 'transparent')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledResourceCard = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.border.color.medium};
    box-shadow: ${({ theme }) => theme.boxShadow.light};
  }
`;

const StyledCardPreview = styled.div<{ fileType: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 140px;
  background: ${({ theme, fileType }) => {
    switch (fileType) {
      case 'pdf':
        return theme.color.red10;
      case 'doc':
        return theme.color.blue10;
      case 'image':
        return theme.color.green10;
      case 'spreadsheet':
        return theme.color.orange10;
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
      case 'spreadsheet':
        return theme.color.orange;
      default:
        return theme.font.color.secondary;
    }
  }};
`;

const StyledCardContent = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledCardTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledCardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledCardInfo = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledCardBadge = styled.span<{ type: string }>`
  display: inline-flex;
  padding: ${({ theme }) => `${theme.spacing(0.5)} ${theme.spacing(1.5)}`};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  font-size: ${({ theme }) => theme.font.size.xs};
  background: ${({ theme, type }) => {
    switch (type) {
      case 'template':
        return theme.color.blue10;
      case 'resource':
        return theme.color.green10;
      case 'form':
        return theme.color.purple10;
      default:
        return theme.background.tertiary;
    }
  }};
  color: ${({ theme, type }) => {
    switch (type) {
      case 'template':
        return theme.color.blue;
      case 'resource':
        return theme.color.green;
      case 'form':
        return theme.color.purple;
      default:
        return theme.font.color.secondary;
    }
  }};
`;

const StyledCardActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xs};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.border.radius.sm};

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const RESOURCE_TABS = [
  { id: 'all', label: 'All Resources' },
  { id: 'templates', label: 'Templates' },
  { id: 'forms', label: 'Forms' },
  { id: 'guides', label: 'Guides' },
  { id: 'marketing', label: 'Marketing' },
];

export const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - would come from Resource entity
  const resources = [
    {
      id: '1',
      name: 'Buyer Representation Agreement',
      type: 'template',
      fileType: 'pdf',
      size: '245 KB',
      downloads: 156,
      category: 'templates',
      updatedAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Seller Disclosure Form',
      type: 'form',
      fileType: 'pdf',
      size: '180 KB',
      downloads: 234,
      category: 'forms',
      updatedAt: '2024-01-10',
    },
    {
      id: '3',
      name: 'First-Time Buyer Guide',
      type: 'resource',
      fileType: 'pdf',
      size: '1.2 MB',
      downloads: 89,
      category: 'guides',
      updatedAt: '2024-01-12',
    },
    {
      id: '4',
      name: 'Property Flyer Template',
      type: 'template',
      fileType: 'doc',
      size: '450 KB',
      downloads: 312,
      category: 'marketing',
      updatedAt: '2024-01-18',
    },
    {
      id: '5',
      name: 'Social Media Image Pack',
      type: 'resource',
      fileType: 'image',
      size: '15 MB',
      downloads: 178,
      category: 'marketing',
      updatedAt: '2024-01-20',
    },
    {
      id: '6',
      name: 'Commission Calculator',
      type: 'template',
      fileType: 'spreadsheet',
      size: '85 KB',
      downloads: 445,
      category: 'templates',
      updatedAt: '2024-01-08',
    },
    {
      id: '7',
      name: 'Closing Checklist',
      type: 'template',
      fileType: 'pdf',
      size: '120 KB',
      downloads: 567,
      category: 'templates',
      updatedAt: '2024-01-05',
    },
    {
      id: '8',
      name: 'Lead Follow-up Scripts',
      type: 'resource',
      fileType: 'doc',
      size: '35 KB',
      downloads: 234,
      category: 'guides',
      updatedAt: '2024-01-14',
    },
  ];

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <IconPdf size={48} />;
      case 'doc':
        return <IconFileWord size={48} />;
      case 'image':
        return <IconPhoto size={48} />;
      case 'spreadsheet':
        return <IconFileSpreadsheet size={48} />;
      default:
        return <IconFile size={48} />;
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesTab =
      activeTab === 'all' || resource.category === activeTab;
    const matchesSearch =
      searchQuery === '' ||
      resource.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledTitle>
          <IconFolder size={24} />
          Resources
        </StyledTitle>
        <StyledToolbar>
          <StyledButton>
            <IconPlus size={16} />
            New Folder
          </StyledButton>
          <StyledButton variant="primary">
            <IconUpload size={16} />
            Upload Resource
          </StyledButton>
        </StyledToolbar>
      </StyledHeader>

      <StyledSearchBar>
        <IconSearch size={18} />
        <StyledSearchInput
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <StyledButton>
          <IconFilter size={16} />
          Filters
        </StyledButton>
      </StyledSearchBar>

      <StyledTabs>
        {RESOURCE_TABS.map((tab) => (
          <StyledTab
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </StyledTab>
        ))}
      </StyledTabs>

      <StyledContent>
        <StyledGrid>
          {filteredResources.map((resource) => (
            <StyledResourceCard key={resource.id}>
              <StyledCardPreview fileType={resource.fileType}>
                {getFileIcon(resource.fileType)}
              </StyledCardPreview>
              <StyledCardContent>
                <StyledCardTitle>{resource.name}</StyledCardTitle>
                <StyledCardMeta>
                  <StyledCardInfo>
                    {resource.size} • {resource.downloads} downloads
                  </StyledCardInfo>
                  <StyledCardBadge type={resource.type}>
                    {resource.type.charAt(0).toUpperCase() +
                      resource.type.slice(1)}
                  </StyledCardBadge>
                </StyledCardMeta>
              </StyledCardContent>
              <StyledCardActions>
                <StyledIconButton>
                  <IconEye size={14} />
                  View
                </StyledIconButton>
                <StyledIconButton>
                  <IconDownload size={14} />
                  Download
                </StyledIconButton>
                <StyledIconButton>
                  <IconShare size={14} />
                  Share
                </StyledIconButton>
              </StyledCardActions>
            </StyledResourceCard>
          ))}
        </StyledGrid>
      </StyledContent>
    </StyledContainer>
  );
};
