import styled from '@emotion/styled';
import { useState } from 'react';
import {
    IconBrandFacebook,
    IconDeviceFloppy,
    IconEye,
    IconGripVertical,
    IconHome,
    IconLayoutGrid,
    IconLink,
    IconListDetails,
    IconMail,
    IconPhoto,
    IconPlus,
    IconSend,
    IconStar,
    IconTrash,
    IconTypography,
    IconUser,
} from 'twenty-ui/display';

const StyledBuilderContainer = styled.div`
  display: flex;
  height: 100%;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledSidebar = styled.div`
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.background.secondary};
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
  overflow-y: auto;
`;

const StyledSidebarSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSidebarTitle = styled.h3`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
`;

const StyledBlockGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledBlockItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: grab;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.color.blue};
    box-shadow: ${({ theme }) => theme.boxShadow.light};
  }

  &:active {
    cursor: grabbing;
  }
`;

const StyledBlockIcon = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledBlockLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.secondary};
  text-align: center;
`;

const StyledMainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
  overflow-y: auto;
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

const StyledToolbarRight = styled.div`
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

const StyledEmailCanvas = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(6)};
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  overflow-y: auto;
`;

const StyledEmailPreview = styled.div`
  width: 600px;
  max-width: 100%;
  background: white;
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  overflow: hidden;
`;

const StyledEmailBlock = styled.div<{ isSelected: boolean }>`
  position: relative;
  padding: ${({ theme }) => theme.spacing(4)};
  border: 2px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.color.blue : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.color.blue30};
  }
`;

const StyledBlockActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  opacity: 0;
  transition: opacity 0.2s ease;

  ${StyledEmailBlock}:hover & {
    opacity: 1;
  }
`;

const StyledIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.font.color.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.boxShadow.light};

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledEmptyCanvas = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(12)};
  gap: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme }) => theme.font.color.tertiary};
  border: 2px dashed ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

const StyledPropertiesPanel = styled.div`
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.background.secondary};
  border-left: 1px solid ${({ theme }) => theme.border.color.light};
  overflow-y: auto;
`;

const StyledPropertyGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPropertyLabel = styled.label`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledInput = styled.input`
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-size: ${({ theme }) => theme.font.size.sm};
  background: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.font.color.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledTextarea = styled.textarea`
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-size: ${({ theme }) => theme.font.size.sm};
  background: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.font.color.primary};
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

// Block types
const BLOCK_TYPES = [
  { id: 'header', label: 'Header', icon: IconTypography },
  { id: 'text', label: 'Text', icon: IconTypography },
  { id: 'image', label: 'Image', icon: IconPhoto },
  { id: 'button', label: 'Button', icon: IconLink },
  { id: 'divider', label: 'Divider', icon: IconLayoutGrid },
  { id: 'property', label: 'Property Card', icon: IconHome },
  { id: 'agent', label: 'Agent Card', icon: IconUser },
  { id: 'social', label: 'Social Links', icon: IconBrandFacebook },
  { id: 'listing', label: 'Just Listed', icon: IconStar },
  { id: 'sold', label: 'Just Sold', icon: IconStar },
  { id: 'openhouse', label: 'Open House', icon: IconHome },
  { id: 'footer', label: 'Footer', icon: IconListDetails },
];

type EmailBlock = {
  id: string;
  type: string;
  content: Record<string, unknown>;
};

export const NewsletterBuilder = () => {
  const [blocks, setBlocks] = useState<EmailBlock[]>([
    {
      id: '1',
      type: 'header',
      content: {
        title: 'Your Company Name',
        subtitle: 'Your tagline here',
        backgroundColor: '#1961ed',
      },
    },
    {
      id: '2',
      type: 'text',
      content: {
        text: 'Welcome to our newsletter! We have some exciting updates to share with you.',
        alignment: 'left',
      },
    },
    {
      id: '3',
      type: 'listing',
      content: {
        address: '123 Main Street, Austin, TX 78701',
        price: '$450,000',
        beds: 3,
        baths: 2,
        sqft: 1800,
        imageUrl: '',
      },
    },
  ]);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  const addBlock = (type: string) => {
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };

  const getDefaultContent = (type: string): Record<string, unknown> => {
    switch (type) {
      case 'header':
        return { title: 'Header Title', subtitle: 'Subtitle', backgroundColor: '#1961ed' };
      case 'text':
        return { text: 'Enter your text here...', alignment: 'left' };
      case 'image':
        return { url: '', alt: 'Image', width: '100%' };
      case 'button':
        return { text: 'Click Here', url: '#', backgroundColor: '#1961ed' };
      case 'property':
        return { address: '', price: '', beds: 0, baths: 0, sqft: 0 };
      case 'listing':
        return { address: 'Property Address', price: '$000,000', status: 'Just Listed' };
      case 'sold':
        return { address: 'Property Address', price: '$000,000', status: 'Just Sold' };
      case 'openhouse':
        return { address: 'Property Address', date: '', time: '' };
      case 'footer':
        return { company: 'Company Name', address: '', phone: '', email: '' };
      default:
        return {};
    }
  };

  const renderBlockPreview = (block: EmailBlock) => {
    switch (block.type) {
      case 'header':
        return (
          <div
            style={{
              backgroundColor: block.content.backgroundColor as string,
              color: 'white',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <h1 style={{ margin: 0, fontSize: '24px' }}>
              {block.content.title as string}
            </h1>
            {block.content.subtitle && (
              <p style={{ margin: '8px 0 0', opacity: 0.9 }}>
                {block.content.subtitle as string}
              </p>
            )}
          </div>
        );
      case 'text':
        return (
          <p
            style={{
              margin: 0,
              textAlign: block.content.alignment as 'left' | 'center' | 'right',
            }}
          >
            {block.content.text as string}
          </p>
        );
      case 'listing':
      case 'sold':
        return (
          <div
            style={{
              background:
                block.type === 'listing'
                  ? 'linear-gradient(135deg, #1961ed 0%, #0f4ac7 100%)'
                  : 'linear-gradient(135deg, #00a876 0%, #007a57 100%)',
              color: 'white',
              padding: '24px',
              textAlign: 'center',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '8px',
              }}
            >
              {block.type === 'listing' ? '⭐ Just Listed' : '🎉 Just Sold'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>
              {block.content.address as string}
            </div>
            <div
              style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px' }}
            >
              {block.content.price as string}
            </div>
          </div>
        );
      case 'button':
        return (
          <div style={{ textAlign: 'center' }}>
            <a
              href={block.content.url as string}
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: block.content.backgroundColor as string,
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              {block.content.text as string}
            </a>
          </div>
        );
      case 'footer':
        return (
          <div
            style={{
              backgroundColor: '#f5f5f5',
              padding: '24px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#666',
            }}
          >
            <strong>{block.content.company as string}</strong>
            <br />
            {block.content.address as string}
            <br />
            {block.content.phone as string} | {block.content.email as string}
          </div>
        );
      default:
        return (
          <div style={{ padding: '16px', backgroundColor: '#f5f5f5' }}>
            {block.type} block
          </div>
        );
    }
  };

  return (
    <StyledBuilderContainer>
      {/* Blocks Sidebar */}
      <StyledSidebar>
        <StyledSidebarSection>
          <StyledSidebarTitle>Content Blocks</StyledSidebarTitle>
          <StyledBlockGrid>
            {BLOCK_TYPES.map((blockType) => (
              <StyledBlockItem
                key={blockType.id}
                onClick={() => addBlock(blockType.id)}
                draggable
              >
                <StyledBlockIcon>
                  <blockType.icon size={20} />
                </StyledBlockIcon>
                <StyledBlockLabel>{blockType.label}</StyledBlockLabel>
              </StyledBlockItem>
            ))}
          </StyledBlockGrid>
        </StyledSidebarSection>
      </StyledSidebar>

      {/* Main Canvas Area */}
      <StyledMainArea>
        <StyledToolbar>
          <StyledToolbarLeft>
            <StyledButton>
              <IconEye size={16} />
              Preview
            </StyledButton>
          </StyledToolbarLeft>
          <StyledToolbarRight>
            <StyledButton>
              <IconDeviceFloppy size={16} />
              Save Draft
            </StyledButton>
            <StyledButton variant="primary">
              <IconSend size={16} />
              Send Newsletter
            </StyledButton>
          </StyledToolbarRight>
        </StyledToolbar>

        <StyledEmailCanvas>
          {blocks.length === 0 ? (
            <StyledEmptyCanvas>
              <IconMail size={48} />
              <span>Drag blocks here to build your newsletter</span>
              <StyledButton onClick={() => addBlock('header')}>
                <IconPlus size={16} />
                Add Header Block
              </StyledButton>
            </StyledEmptyCanvas>
          ) : (
            <StyledEmailPreview>
              {blocks.map((block) => (
                <StyledEmailBlock
                  key={block.id}
                  isSelected={selectedBlockId === block.id}
                  onClick={() => setSelectedBlockId(block.id)}
                >
                  <StyledBlockActions>
                    <StyledIconButton>
                      <IconGripVertical size={14} />
                    </StyledIconButton>
                    <StyledIconButton onClick={() => removeBlock(block.id)}>
                      <IconTrash size={14} />
                    </StyledIconButton>
                  </StyledBlockActions>
                  {renderBlockPreview(block)}
                </StyledEmailBlock>
              ))}
            </StyledEmailPreview>
          )}
        </StyledEmailCanvas>
      </StyledMainArea>

      {/* Properties Panel */}
      <StyledPropertiesPanel>
        <StyledSidebarTitle>Block Properties</StyledSidebarTitle>
        {selectedBlock ? (
          <StyledPropertyGroup>
            <StyledPropertyLabel>Block Type</StyledPropertyLabel>
            <StyledInput value={selectedBlock.type} disabled />

            {selectedBlock.type === 'header' && (
              <>
                <StyledPropertyLabel>Title</StyledPropertyLabel>
                <StyledInput
                  value={selectedBlock.content.title as string}
                  onChange={(e) => {
                    setBlocks(
                      blocks.map((b) =>
                        b.id === selectedBlock.id
                          ? { ...b, content: { ...b.content, title: e.target.value } }
                          : b,
                      ),
                    );
                  }}
                />
                <StyledPropertyLabel>Subtitle</StyledPropertyLabel>
                <StyledInput
                  value={selectedBlock.content.subtitle as string}
                  onChange={(e) => {
                    setBlocks(
                      blocks.map((b) =>
                        b.id === selectedBlock.id
                          ? { ...b, content: { ...b.content, subtitle: e.target.value } }
                          : b,
                      ),
                    );
                  }}
                />
                <StyledPropertyLabel>Background Color</StyledPropertyLabel>
                <StyledInput
                  type="color"
                  value={selectedBlock.content.backgroundColor as string}
                  onChange={(e) => {
                    setBlocks(
                      blocks.map((b) =>
                        b.id === selectedBlock.id
                          ? { ...b, content: { ...b.content, backgroundColor: e.target.value } }
                          : b,
                      ),
                    );
                  }}
                />
              </>
            )}

            {selectedBlock.type === 'text' && (
              <>
                <StyledPropertyLabel>Text Content</StyledPropertyLabel>
                <StyledTextarea
                  value={selectedBlock.content.text as string}
                  onChange={(e) => {
                    setBlocks(
                      blocks.map((b) =>
                        b.id === selectedBlock.id
                          ? { ...b, content: { ...b.content, text: e.target.value } }
                          : b,
                      ),
                    );
                  }}
                />
              </>
            )}

            {(selectedBlock.type === 'listing' || selectedBlock.type === 'sold') && (
              <>
                <StyledPropertyLabel>Property Address</StyledPropertyLabel>
                <StyledInput
                  value={selectedBlock.content.address as string}
                  onChange={(e) => {
                    setBlocks(
                      blocks.map((b) =>
                        b.id === selectedBlock.id
                          ? { ...b, content: { ...b.content, address: e.target.value } }
                          : b,
                      ),
                    );
                  }}
                />
                <StyledPropertyLabel>Price</StyledPropertyLabel>
                <StyledInput
                  value={selectedBlock.content.price as string}
                  onChange={(e) => {
                    setBlocks(
                      blocks.map((b) =>
                        b.id === selectedBlock.id
                          ? { ...b, content: { ...b.content, price: e.target.value } }
                          : b,
                      ),
                    );
                  }}
                />
              </>
            )}
          </StyledPropertyGroup>
        ) : (
          <p style={{ color: '#666', fontSize: '14px' }}>
            Select a block to edit its properties
          </p>
        )}
      </StyledPropertiesPanel>
    </StyledBuilderContainer>
  );
};
