import { useMutation, useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import {
  ADD_STOCK,
  GET_LOW_STOCK_ALERTS,
  GET_STOCK_VALUATION,
} from '../hooks/useInventory';

const SEVERITY_COLORS: Record<string, string> = {
  critical: themeCssVariables.color.red,
  warning: themeCssVariables.color.orange,
  normal: themeCssVariables.color.turquoise,
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledToolbar = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
  align-items: center;
`;

const StyledButton = styled.button`
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  background: ${themeCssVariables.color.blue};
  color: ${themeCssVariables.font.color.inverted};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledInput = styled.input`
  padding: 6px 10px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
  width: 120px;
`;

const StyledForm = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
`;

const StyledValuation = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 8px;
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${themeCssVariables.spacing[3]};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div<{ borderColor: string }>`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-left: 4px solid ${({ borderColor }) => borderColor};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSku = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledAlert = styled.span`
  color: ${themeCssVariables.color.red};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledLoading = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledError = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.color.red};
`;

export const StockDashboard = () => {
  useLingui();

  const [showForm, setShowForm] = useState(false);
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [quantity, setQuantity] = useState('');

  const {
    data: alertsData,
    loading,
    error,
    refetch: refetchAlerts,
  } = useQuery(GET_LOW_STOCK_ALERTS);
  const { data: valuationData } = useQuery(GET_STOCK_VALUATION);

  const [addStock, { loading: adding }] = useMutation(ADD_STOCK, {
    onCompleted: () => {
      setProductId('');
      setWarehouseId('');
      setQuantity('');
      setShowForm(false);
      refetchAlerts();
    },
  });

  const handleAddStock = () => {
    if (!productId || !quantity) return;
    addStock({
      variables: {
        input: {
          productId,
          warehouseId: warehouseId || undefined,
          quantity: Number(quantity),
        },
      },
    });
  };

  if (loading) return <StyledLoading>{t`Loading...`}</StyledLoading>;
  if (error) return <StyledError>{t`Error: ${error.message}`}</StyledError>;

  const alerts = alertsData?.lowStockAlerts ?? [];
  const valuation = valuationData?.stockValuation;

  return (
    <StyledContainer>
      <StyledToolbar>
        <StyledName>{t`Stock Levels`}</StyledName>
        <StyledButton onClick={() => setShowForm(!showForm)}>
          {showForm ? t`Cancel` : t`Add Stock`}
        </StyledButton>
      </StyledToolbar>

      {showForm && (
        <StyledForm>
          <StyledInput
            placeholder={t`Product ID`}
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
          />
          <StyledInput
            placeholder={t`Warehouse ID`}
            value={warehouseId}
            onChange={(event) => setWarehouseId(event.target.value)}
          />
          <StyledInput
            type="number"
            placeholder={t`Quantity`}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
          <StyledButton onClick={handleAddStock} disabled={adding}>
            {adding ? t`Adding...` : t`Submit`}
          </StyledButton>
        </StyledForm>
      )}

      {valuation && (
        <StyledValuation>
          {t`Total Valuation`}: {valuation.currency}{' '}
          {valuation.totalValue?.toLocaleString()} ({valuation.itemCount}{' '}
          {t`items`})
        </StyledValuation>
      )}

      {alerts.length > 0 && (
        <StyledAlert>
          {t`${alerts.length} items need attention`}
        </StyledAlert>
      )}

      <StyledGrid>
        {alerts.map(
          (item: {
            id: string;
            sku: string;
            productName: string;
            currentStock: number;
            reorderPoint: number;
            severity: string;
            daysUntilStockout: number;
            warehouseName: string;
          }) => (
            <StyledCard
              key={item.id}
              borderColor={
                SEVERITY_COLORS[item.severity] ?? themeCssVariables.color.orange
              }
            >
              <StyledSku>{item.sku}</StyledSku>
              <StyledName>{item.productName}</StyledName>
              <StyledRow>
                <span>
                  {t`Qty`}: {item.currentStock}
                </span>
                <span>
                  {t`Reorder`}: {item.reorderPoint}
                </span>
              </StyledRow>
              <StyledRow>
                <span>
                  {t`Warehouse`}: {item.warehouseName}
                </span>
                <span>
                  {item.daysUntilStockout != null
                    ? t`${item.daysUntilStockout}d to stockout`
                    : item.severity}
                </span>
              </StyledRow>
            </StyledCard>
          ),
        )}
      </StyledGrid>
    </StyledContainer>
  );
};
