import { useTranslation } from 'react-i18next';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { H2Title, IconButton, Badge } from 'twenty-ui';
import styled from '@emotion/styled';
import { IconPackage, IconAlertTriangle, IconPlus, IconStack, IconCash } from '@tabler/icons-react';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const Card = styled.div<{ accentColor?: string }>`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  padding: 20px;
  border-top: 3px solid ${({ accentColor }) => accentColor ?? '#3B82F6'};
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const CardTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: 13px;
`;

const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProductItem = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: 6px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 3px solid #3B82F6;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
`;

const ProductMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  gap: 16px;
`;

const StockBadge = styled.span<{ low?: boolean }>`
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ low }) => low ? '#FEE2E2' : '#D1FAE5'};
  color: ${({ low }) => low ? '#DC2626' : '#059669'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

export const SettingsInventory = () => {
  const { t } = useTranslation();

  const { records: products, loading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Product,
    limit: 30,
    orderBy: [{ createdAt: 'DESC' }],
  });

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <SubMenuTopBarContainer
      title={t('Inventario')}
      links={[
        { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
        { children: t('Inventario') },
      ]}
    >
      <StyledContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <H2Title title={t('Gestión de Inventario')} />
          <IconButton Icon={IconPlus} variant="primary" size="small" onClick={() => {}} />
        </div>

        <Grid>
          <Card accentColor="#3B82F6">
            <CardTitle>
              <IconPackage size={20} />
              {t('Productos')}
            </CardTitle>
            <CardDescription>{t('Gestiona tu inventario de productos')}</CardDescription>
          </Card>
          <Card accentColor="#F59E0B">
            <CardTitle>
              <IconAlertTriangle size={20} />
              {t('Alertas')}
            </CardTitle>
            <CardDescription>{t('Alertas de stock bajo')}</CardDescription>
          </Card>
        </Grid>

        <H2Title title={t('Productos')} />
        
        {loading ? (
          <EmptyState>{t('Cargando...')}</EmptyState>
        ) : products.length === 0 ? (
          <EmptyState>
            <IconPackage size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div>{t('No hay productos')}</div>
            <div style={{ fontSize: '13px', marginTop: '8px' }}>
              {t('Agrega tu primer producto')}
            </div>
          </EmptyState>
        ) : (
          <ProductList>
            {products.map((product: any) => {
              const stockLow = product.stockQuantity !== null && 
                product.reorderPoint !== null && 
                product.stockQuantity <= product.reorderPoint;
              
              return (
                <ProductItem key={product.id}>
                  <ProductInfo>
                    <ProductName>{product.name || 'Sin nombre'}</ProductName>
                    <ProductMeta>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconStack size={12} />
                        SKU: {product.sku || '-'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconCash size={12} />
                        {formatCurrency(product.price)}
                      </span>
                    </ProductMeta>
                  </ProductInfo>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <StockBadge low={stockLow}>
                      {product.stockQuantity !== null ? `${product.stockQuantity} uds` : 'Sin stock'}
                    </StockBadge>
                    {stockLow && <IconAlertTriangle size={16} color="#DC2626" />}
                  </div>
                </ProductItem>
              );
            })}
          </ProductList>
        )}
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
