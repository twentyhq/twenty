import styled from '@emotion/styled';
import { useState } from 'react';
import {
  IconMail,
  IconTemplate,
  IconFolder,
  IconSparkles,
  IconBrandInstagram,
  IconMessage,
  IconSettings,
} from 'twenty-ui/display';

import { NewsletterBuilder } from './NewsletterBuilder';
import { PropertyPostGenerator } from './PropertyPostGenerator';
import { ResourcesPage } from './ResourcesPage';

const StyledContainer = styled.div`
  display: flex;
  height: 100%;
`;

const StyledSidebar = styled.div`
  width: 240px;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background.secondary};
  border-right: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledSidebarHeader = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledSidebarTitle = styled.h2`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
`;

const StyledNavSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledNavTitle = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(2)}`};
`;

const StyledNavItem = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
  border: none;
  background: ${({ theme, isActive }) =>
    isActive ? theme.color.blue10 : 'transparent'};
  color: ${({ theme, isActive }) =>
    isActive ? theme.color.blue : theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme, isActive }) =>
    isActive ? theme.font.weight.medium : theme.font.weight.regular};
  text-align: left;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, isActive }) =>
      isActive ? theme.color.blue10 : theme.background.tertiary};
    color: ${({ theme, isActive }) =>
      isActive ? theme.color.blue : theme.font.color.primary};
  }
`;

const StyledMainContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

const MARKETING_SECTIONS = [
  {
    title: 'Create',
    items: [
      { id: 'newsletter', label: 'Newsletter Builder', icon: IconMail },
      { id: 'social', label: 'Social Media Posts', icon: IconBrandInstagram },
    ],
  },
  {
    title: 'Templates',
    items: [
      { id: 'email', label: 'Email Templates', icon: IconTemplate },
      { id: 'sms', label: 'SMS Templates', icon: IconMessage },
    ],
  },
  {
    title: 'Library',
    items: [
      { id: 'resources', label: 'Resources', icon: IconFolder },
    ],
  },
];

export const MarketingPage = () => {
  const [activeSection, setActiveSection] = useState('newsletter');

  const renderContent = () => {
    switch (activeSection) {
      case 'newsletter':
        return <NewsletterBuilder />;
      case 'social':
        return <PropertyPostGenerator />;
      case 'resources':
        return <ResourcesPage />;
      case 'email':
        return <EmailTemplatesPlaceholder />;
      case 'sms':
        return <SmsTemplatesPlaceholder />;
      default:
        return <NewsletterBuilder />;
    }
  };

  return (
    <StyledContainer>
      <StyledSidebar>
        <StyledSidebarHeader>
          <StyledSidebarTitle>Marketing</StyledSidebarTitle>
        </StyledSidebarHeader>

        {MARKETING_SECTIONS.map((section) => (
          <StyledNavSection key={section.title}>
            <StyledNavTitle>{section.title}</StyledNavTitle>
            {section.items.map((item) => (
              <StyledNavItem
                key={item.id}
                isActive={activeSection === item.id}
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon size={18} />
                {item.label}
              </StyledNavItem>
            ))}
          </StyledNavSection>
        ))}
      </StyledSidebar>

      <StyledMainContent>{renderContent()}</StyledMainContent>
    </StyledContainer>
  );
};

// Placeholder components for email and SMS templates
const StyledPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const EmailTemplatesPlaceholder = () => (
  <StyledPlaceholder>
    <IconTemplate size={48} />
    <span>Email Templates - Coming Soon</span>
  </StyledPlaceholder>
);

const SmsTemplatesPlaceholder = () => (
  <StyledPlaceholder>
    <IconMessage size={48} />
    <span>SMS Templates - Coming Soon</span>
  </StyledPlaceholder>
);
