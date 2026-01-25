import styled from '@emotion/styled';
import { useState } from 'react';
import {
  IconPhoto,
  IconDownload,
  IconShare,
  IconSparkles,
  IconHome,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTwitter,
  IconRefresh,
  IconCopy,
} from 'twenty-ui/display';

const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(6)};
  height: 100%;
`;

const StyledFormSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
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

const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

const StyledCardTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
`;

const StyledFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLabel = styled.label`
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

const StyledSelect = styled.select`
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
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledPostTypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPostTypeButton = styled.button<{ isSelected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.color.blue : theme.border.color.light};
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.color.blue10 : theme.background.primary};
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.color.blue : theme.font.color.secondary};

  &:hover {
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledPostTypeLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(4)}`};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-size: ${({ theme }) => theme.font.size.md};
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

const StyledPreviewSection = styled.div`
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledPreviewCard = styled.div<{ postType: string }>`
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(6)};
  border-radius: ${({ theme }) => theme.border.radius.lg};
  background: ${({ postType }) => {
    switch (postType) {
      case 'just_listed':
        return 'linear-gradient(135deg, #1961ed 0%, #0f4ac7 100%)';
      case 'just_sold':
        return 'linear-gradient(135deg, #00a876 0%, #007a57 100%)';
      case 'open_house':
        return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'price_drop':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      default:
        return 'linear-gradient(135deg, #1961ed 0%, #0f4ac7 100%)';
    }
  }};
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 50%
    );
  }
`;

const StyledBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.border.radius.pill};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  text-transform: uppercase;
  letter-spacing: 1px;
  width: fit-content;
`;

const StyledPreviewContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  position: relative;
  z-index: 1;
`;

const StyledPreviewAddress = styled.div`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledPreviewPrice = styled.div`
  font-size: 36px;
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

const StyledPreviewDetails = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledPreviewBranding = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  position: relative;
  z-index: 1;
`;

const StyledAgentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledAgentName = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledAgentPhone = styled.div`
  font-size: ${({ theme }) => theme.font.size.xs};
  opacity: 0.9;
`;

const StyledLogo = styled.div`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.bold};
`;

const StyledCaptionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledCaptionBox = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.primary};
  line-height: 1.5;
`;

const StyledActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSocialButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSocialButton = styled.button<{ platform: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ platform }) => {
    switch (platform) {
      case 'instagram':
        return 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)';
      case 'facebook':
        return '#1877f2';
      case 'twitter':
        return '#1da1f2';
      default:
        return '#666';
    }
  }};
  color: white;

  &:hover {
    transform: scale(1.05);
  }
`;

const POST_TYPES = [
  { id: 'just_listed', label: 'Just Listed', icon: IconHome },
  { id: 'just_sold', label: 'Just Sold', icon: IconHome },
  { id: 'open_house', label: 'Open House', icon: IconHome },
  { id: 'price_drop', label: 'Price Drop', icon: IconHome },
];

export const PropertyPostGenerator = () => {
  const [postType, setPostType] = useState('just_listed');
  const [formData, setFormData] = useState({
    address: '123 Main Street',
    city: 'Austin',
    state: 'TX',
    price: '450000',
    beds: '3',
    baths: '2',
    sqft: '1800',
    agentName: 'Sarah Johnson',
    agentPhone: '(512) 555-1234',
    companyName: 'AIRA Realty',
    openHouseDate: '',
    openHouseTime: '',
    highlights: 'Updated kitchen, Large backyard, Close to downtown',
  });

  const [generatedCaption, setGeneratedCaption] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const getBadgeText = () => {
    switch (postType) {
      case 'just_listed':
        return '⭐ Just Listed';
      case 'just_sold':
        return '🎉 Just Sold';
      case 'open_house':
        return '🏠 Open House';
      case 'price_drop':
        return '💰 Price Reduced';
      default:
        return '⭐ Just Listed';
    }
  };

  const generateCaption = () => {
    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const captions: Record<string, string> = {
        just_listed: `🏠 NEW LISTING ALERT! 🎉\n\n${formData.address}, ${formData.city}, ${formData.state}\n\n✨ ${formData.beds} Beds | ${formData.baths} Baths | ${formData.sqft} sq ft\n💰 Listed at $${parseInt(formData.price).toLocaleString()}\n\n${formData.highlights}\n\n📱 DM or call ${formData.agentPhone} for a private showing!\n\n#JustListed #RealEstate #${formData.city}Homes #DreamHome #NewListing #${formData.state}RealEstate`,
        just_sold: `🎊 SOLD! Another happy homeowner! 🏡\n\n${formData.address}, ${formData.city}, ${formData.state}\n\n💰 Sold for $${parseInt(formData.price).toLocaleString()}\n\nCongratulations to my amazing clients on their new home! It was an honor to help you through this journey. 🔑\n\nThinking about buying or selling? Let's chat!\n📱 ${formData.agentPhone}\n\n#JustSold #RealEstate #Sold #${formData.city} #HomeSweetHome #ClosingDay`,
        open_house: `🏠 OPEN HOUSE THIS WEEKEND! 🎈\n\n📍 ${formData.address}, ${formData.city}, ${formData.state}\n📅 ${formData.openHouseDate}\n⏰ ${formData.openHouseTime}\n\n✨ ${formData.beds} Beds | ${formData.baths} Baths | ${formData.sqft} sq ft\n💰 $${parseInt(formData.price).toLocaleString()}\n\n${formData.highlights}\n\nCome see your future home! No appointment needed.\n\n#OpenHouse #RealEstate #${formData.city} #HomeForSale #Weekend`,
        price_drop: `💰 PRICE REDUCED! Amazing opportunity! 🏠\n\n${formData.address}, ${formData.city}, ${formData.state}\n\n✨ ${formData.beds} Beds | ${formData.baths} Baths | ${formData.sqft} sq ft\n💵 NOW $${parseInt(formData.price).toLocaleString()}\n\nDon't miss out on this incredible value!\n\n📱 Call ${formData.agentPhone} today!\n\n#PriceReduced #RealEstate #Deal #${formData.city} #MotivatedSeller`,
      };

      setGeneratedCaption(captions[postType] || captions.just_listed);
      setIsGenerating(false);
    }, 1500);
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(generatedCaption);
  };

  return (
    <StyledContainer>
      <StyledFormSection>
        <StyledTitle>
          <IconSparkles size={24} />
          AI Property Post Generator
        </StyledTitle>

        {/* Post Type Selection */}
        <StyledCard>
          <StyledCardTitle>Post Type</StyledCardTitle>
          <StyledPostTypeGrid>
            {POST_TYPES.map((type) => (
              <StyledPostTypeButton
                key={type.id}
                isSelected={postType === type.id}
                onClick={() => setPostType(type.id)}
              >
                <type.icon size={24} />
                <StyledPostTypeLabel>{type.label}</StyledPostTypeLabel>
              </StyledPostTypeButton>
            ))}
          </StyledPostTypeGrid>
        </StyledCard>

        {/* Property Details */}
        <StyledCard>
          <StyledCardTitle>Property Details</StyledCardTitle>
          <StyledFormGroup>
            <StyledLabel>Address</StyledLabel>
            <StyledInput
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="123 Main Street"
            />
          </StyledFormGroup>
          <StyledRow>
            <StyledFormGroup>
              <StyledLabel>City</StyledLabel>
              <StyledInput
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </StyledFormGroup>
            <StyledFormGroup>
              <StyledLabel>State</StyledLabel>
              <StyledInput
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
              />
            </StyledFormGroup>
            <StyledFormGroup>
              <StyledLabel>Price</StyledLabel>
              <StyledInput
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </StyledFormGroup>
          </StyledRow>
          <StyledRow>
            <StyledFormGroup>
              <StyledLabel>Beds</StyledLabel>
              <StyledInput
                value={formData.beds}
                onChange={(e) =>
                  setFormData({ ...formData, beds: e.target.value })
                }
              />
            </StyledFormGroup>
            <StyledFormGroup>
              <StyledLabel>Baths</StyledLabel>
              <StyledInput
                value={formData.baths}
                onChange={(e) =>
                  setFormData({ ...formData, baths: e.target.value })
                }
              />
            </StyledFormGroup>
            <StyledFormGroup>
              <StyledLabel>Sq Ft</StyledLabel>
              <StyledInput
                value={formData.sqft}
                onChange={(e) =>
                  setFormData({ ...formData, sqft: e.target.value })
                }
              />
            </StyledFormGroup>
          </StyledRow>
          <StyledFormGroup>
            <StyledLabel>Property Highlights</StyledLabel>
            <StyledTextarea
              value={formData.highlights}
              onChange={(e) =>
                setFormData({ ...formData, highlights: e.target.value })
              }
              placeholder="Updated kitchen, Large backyard, etc."
            />
          </StyledFormGroup>
        </StyledCard>

        {/* Agent Info */}
        <StyledCard>
          <StyledCardTitle>Agent Information</StyledCardTitle>
          <StyledRow>
            <StyledFormGroup>
              <StyledLabel>Agent Name</StyledLabel>
              <StyledInput
                value={formData.agentName}
                onChange={(e) =>
                  setFormData({ ...formData, agentName: e.target.value })
                }
              />
            </StyledFormGroup>
            <StyledFormGroup>
              <StyledLabel>Phone</StyledLabel>
              <StyledInput
                value={formData.agentPhone}
                onChange={(e) =>
                  setFormData({ ...formData, agentPhone: e.target.value })
                }
              />
            </StyledFormGroup>
            <StyledFormGroup>
              <StyledLabel>Company</StyledLabel>
              <StyledInput
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
              />
            </StyledFormGroup>
          </StyledRow>
        </StyledCard>

        <StyledButton variant="primary" onClick={generateCaption}>
          <IconSparkles size={18} />
          {isGenerating ? 'Generating...' : 'Generate Post & Caption'}
        </StyledButton>
      </StyledFormSection>

      {/* Preview Section */}
      <StyledPreviewSection>
        <StyledCardTitle>Preview</StyledCardTitle>

        <StyledPreviewCard postType={postType}>
          <StyledBadge>{getBadgeText()}</StyledBadge>

          <StyledPreviewContent>
            <StyledPreviewAddress>
              {formData.address}
              <br />
              {formData.city}, {formData.state}
            </StyledPreviewAddress>
            <StyledPreviewPrice>
              ${parseInt(formData.price || '0').toLocaleString()}
            </StyledPreviewPrice>
            <StyledPreviewDetails>
              <span>{formData.beds} Beds</span>
              <span>•</span>
              <span>{formData.baths} Baths</span>
              <span>•</span>
              <span>{formData.sqft} sqft</span>
            </StyledPreviewDetails>
          </StyledPreviewContent>

          <StyledPreviewBranding>
            <StyledAgentInfo>
              <StyledAgentName>{formData.agentName}</StyledAgentName>
              <StyledAgentPhone>{formData.agentPhone}</StyledAgentPhone>
            </StyledAgentInfo>
            <StyledLogo>{formData.companyName}</StyledLogo>
          </StyledPreviewBranding>
        </StyledPreviewCard>

        <StyledActionButtons>
          <StyledButton style={{ flex: 1 }}>
            <IconDownload size={16} />
            Download Image
          </StyledButton>
          <StyledSocialButtons>
            <StyledSocialButton platform="instagram">
              <IconBrandInstagram size={20} />
            </StyledSocialButton>
            <StyledSocialButton platform="facebook">
              <IconBrandFacebook size={20} />
            </StyledSocialButton>
            <StyledSocialButton platform="twitter">
              <IconBrandTwitter size={20} />
            </StyledSocialButton>
          </StyledSocialButtons>
        </StyledActionButtons>

        {generatedCaption && (
          <StyledCaptionSection>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <StyledCardTitle>Generated Caption</StyledCardTitle>
              <div style={{ display: 'flex', gap: '8px' }}>
                <StyledButton onClick={generateCaption}>
                  <IconRefresh size={14} />
                </StyledButton>
                <StyledButton onClick={copyCaption}>
                  <IconCopy size={14} />
                  Copy
                </StyledButton>
              </div>
            </div>
            <StyledCaptionBox>{generatedCaption}</StyledCaptionBox>
          </StyledCaptionSection>
        )}
      </StyledPreviewSection>
    </StyledContainer>
  );
};
