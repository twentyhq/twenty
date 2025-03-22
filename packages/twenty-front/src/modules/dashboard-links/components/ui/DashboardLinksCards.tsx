/* eslint-disable @nx/workspace-no-hardcoded-colors */
/* eslint-disable @nx/workspace-styled-components-prefixed-with-styled */
/* eslint-disable no-restricted-imports */
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

interface DashboardLinksCardsProps {
  chartData: {
    linkName: string;
    uv: number;
  }[];
}

export const DashboardLinksCards = ({
  chartData,
}: DashboardLinksCardsProps) => {
  console.log('opaa', chartData);
  // Função para escolher o ícone com base no linkName
  const getIcon = (chartData: string) => {
    switch (chartData.toLowerCase()) {
      case 'google':
        return <IconBrandGoogle />;
      case 'facebook':
        return <IconBrandFacebook />;
      case 'twitter':
        return <IconBrandTwitter />;
      default:
        return <IconBrandGoogle />; // Ícone padrão
    }
  };

  return (
    <CardsContainer>
      {chartData.map((log, index) => (
        <Card key={index}>
          <CardHeader>
            <CardIcon>{getIcon(log.linkName)}</CardIcon>
            <CardName>{log.linkName}</CardName>
          </CardHeader>
          <CardValue>{log.uv}</CardValue>
        </Card>
      ))}
    </CardsContainer>
  );
};
