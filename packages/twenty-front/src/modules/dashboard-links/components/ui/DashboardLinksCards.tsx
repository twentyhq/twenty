/* eslint-disable no-restricted-imports */
/* eslint-disable @nx/workspace-no-hardcoded-colors */
/* eslint-disable @nx/workspace-styled-components-prefixed-with-styled */
import styled from '@emotion/styled';
import {
  IconBrandFacebook,
  IconBrandGoogle,
  IconBrandTwitter,
} from '@tabler/icons-react';

type CardData = {
  icon: React.ReactNode;
  name: string;
  value: number;
};

const CardsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(3)};
`;

const Card = styled.div`
  background: #fcfcfc;
  border-radius: 8px;
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  max-width: 300px;
  border: 1px solid #ebebeb;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const CardIcon = styled.div`
  color: ${({ theme }) => theme.color.turquoise80};
  font-size: 20px;
`;

const CardName = styled.div`
  color: ${({ theme }) => theme.color.green80};
  font-size: 16px;
  font-weight: 500;
`;

const CardValue = styled.div`
  color: ${({ theme }) => theme.color.green80};
  font-size: 20px;
  font-weight: 600;
  margin-top: ${({ theme }) => theme.spacing(2)};
  text-align: right;
`;

const mockCardData: CardData[] = [
  {
    icon: <IconBrandGoogle />,
    name: 'Google Ads',
    value: 56,
  },
  {
    icon: <IconBrandFacebook />,
    name: 'Facebook Ads',
    value: 34,
  },
  {
    icon: <IconBrandTwitter />,
    name: 'Twitter Ads',
    value: 22,
  },
];

export const DashboardLinksCards = () => {
  return (
    <CardsContainer>
      {mockCardData.map((card, index) => (
        <Card key={index}>
          <CardHeader>
            <CardIcon>{card.icon}</CardIcon>
            <CardName>{card.name}</CardName>
          </CardHeader>
          <CardValue>{card.value}</CardValue>
        </Card>
      ))}
    </CardsContainer>
  );
};
