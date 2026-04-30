import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { POStatus, PurchaseOrderData } from '../types/trade.types';
import { GET_TRADE_IMPORT_DATA } from '../hooks/useTradeImport';

const SCC: Record<POStatus, string> = { draft: themeCssVariables.color.gray50, submitted: themeCssVariables.color.blue, confirmed: themeCssVariables.color.turquoise, shipped: themeCssVariables.color.yellow, delivered: themeCssVariables.color.green, cancelled: themeCssVariables.color.red };
const SC = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[2]}; `;
const ST = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const STable = styled.table` width: 100%; border-collapse: collapse; `;
const STh = styled.th` text-align: left; padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.tertiary}; border-bottom: 1px solid ${themeCssVariables.border.color.medium}; `;
const STd = styled.td` padding: ${themeCssVariables.spacing[2]}; font-size: ${themeCssVariables.font.size.md}; color: ${themeCssVariables.font.color.primary}; border-bottom: 1px solid ${themeCssVariables.border.color.light}; `;
const SBadge = styled.span<{ color: string }>` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; font-weight: ${themeCssVariables.font.weight.medium}; background: ${({ color }) => color}; color: ${themeCssVariables.font.color.inverted}; `;

export const PurchaseOrderList = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_TRADE_IMPORT_DATA);
  if (loading) return <SC>{t`Loading...`}</SC>;
  if (error) return <SC>{t`Error loading data`}</SC>;
  const orders: PurchaseOrderData[] = data?.tradeimportData?.orders ?? [];
  return (
    <SC><ST>{t`Trade Import - Purchase Orders`}</ST><STable><thead><tr><STh>{t`PO Number`}</STh><STh>{t`Supplier`}</STh><STh>{t`Status`}</STh><STh>{t`Amount`}</STh><STh>{t`Items`}</STh></tr></thead><tbody>{orders.map((o) => (<tr key={o.id}><STd>{o.poNumber}</STd><STd>{o.supplier}</STd><STd><SBadge color={SCC[o.status]}>{o.status}</SBadge></STd><STd>{`${o.currency} ${o.totalAmount.toLocaleString()}`}</STd><STd>{o.itemCount}</STd></tr>))}</tbody></STable></SC>
  );
};
