import {
  type CSSProperties,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  closeSidePanel,
  enqueueSnackbar,
  unmountFrontComponent,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';

import { createIdempotencyKey } from 'src/front-components/utils/create-idempotency-key';

export const CONFIRM_PACKAGE_PAYMENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '53ad2cce-110a-4742-a6d8-27528dd24d63';

type CurrencyValue = { amountMicros: number; currencyCode: string };

type ProductOption = {
  id: string;
  name: string;
  visitsIncluded: number;
  validityDays?: number | null;
  price: CurrencyValue;
};

type ConfirmPackagePaymentResponse =
  | {
      success: true;
      duplicate: boolean;
      visitsAvailable: number;
    }
  | { success: false; message: string };

const theme = {
  spacing2: 'var(--t-spacing-2)',
  spacing3: 'var(--t-spacing-3)',
  spacing4: 'var(--t-spacing-4)',
  spacing8: 'var(--t-spacing-8)',
  backgroundPrimary: 'var(--t-background-primary)',
  backgroundSecondary: 'var(--t-background-secondary)',
  borderMedium: 'var(--t-border-color-medium)',
  borderLight: 'var(--t-border-color-light)',
  borderRadius: 'var(--t-border-radius-sm)',
  fontPrimary: 'var(--t-font-color-primary)',
  fontSecondary: 'var(--t-font-color-secondary)',
  fontTertiary: 'var(--t-font-color-tertiary)',
  fontInverted: 'var(--t-font-color-inverted)',
  fontFamily: 'var(--t-font-family)',
  fontSizeSmall: 'var(--t-font-size-sm)',
  fontSizeMedium: 'var(--t-font-size-md)',
  fontWeightMedium: 'var(--t-font-weight-medium)',
  fontWeightSemiBold: 'var(--t-font-weight-semi-bold)',
  blue: 'var(--t-color-blue)',
  accent: 'var(--t-accent-accent4060)',
};

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    color: theme.fontPrimary,
    background: theme.backgroundPrimary,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeSmall,
  },
  header: {
    padding: theme.spacing4,
    borderBottom: `1px solid ${theme.borderLight}`,
  },
  title: {
    margin: 0,
    fontSize: theme.fontSizeMedium,
    fontWeight: theme.fontWeightSemiBold,
  },
  subtitle: { margin: `${theme.spacing2} 0 0`, color: theme.fontTertiary },
  body: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: theme.spacing3,
    padding: theme.spacing4,
    overflowY: 'auto',
  },
  field: { display: 'flex', flexDirection: 'column', gap: theme.spacing2 },
  label: { color: theme.fontSecondary, fontWeight: theme.fontWeightMedium },
  control: {
    height: theme.spacing8,
    boxSizing: 'border-box',
    width: '100%',
    padding: `0 ${theme.spacing3}`,
    color: theme.fontPrimary,
    background: theme.backgroundSecondary,
    border: `1px solid ${theme.borderMedium}`,
    borderRadius: theme.borderRadius,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeSmall,
  },
  summary: {
    padding: theme.spacing3,
    background: theme.backgroundSecondary,
    border: `1px solid ${theme.borderLight}`,
    borderRadius: theme.borderRadius,
    lineHeight: 1.6,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing2,
    padding: theme.spacing3,
    borderTop: `1px solid ${theme.borderLight}`,
  },
  button: {
    height: theme.spacing8,
    padding: `0 ${theme.spacing3}`,
    borderRadius: theme.borderRadius,
    fontFamily: theme.fontFamily,
    fontWeight: theme.fontWeightMedium,
    cursor: 'pointer',
  },
  secondaryButton: {
    color: theme.fontSecondary,
    background: theme.backgroundSecondary,
    border: `1px solid ${theme.borderMedium}`,
  },
  primaryButton: {
    color: theme.fontInverted,
    background: theme.blue,
    border: '1px solid transparent',
  },
  disabledButton: { background: theme.accent, cursor: 'not-allowed' },
};

const readValue = (event: SyntheticEvent<HTMLElement>): string => {
  const valueEvent = event as {
    detail?: { value?: string };
    target?: { value?: string };
  };
  return valueEvent.detail?.value ?? valueEvent.target?.value ?? '';
};

const defaultPaidAt = (): string => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

const formatPrice = (price: CurrencyValue): string =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: price.currencyCode,
    maximumFractionDigits: 0,
  }).format(price.amountMicros / 1_000_000);

const ConfirmPackagePaymentForm = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const personId = selectedRecordIds.length === 1 ? selectedRecordIds[0] : null;
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productId, setProductId] = useState('');
  const [paidAt, setPaidAt] = useState(defaultPaidAt);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'SBP' | 'CARD'>(
    'SBP',
  );
  const [externalId, setExternalId] = useState('');
  const [fiscalReceiptId, setFiscalReceiptId] = useState('');
  const [idempotencyKey] = useState(createIdempotencyKey);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId) ?? null,
    [productId, products],
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await new CoreApiClient().query({
        studioProducts: {
          __args: {
            filter: {
              and: [
                { isActive: { eq: true } },
                {
                  or: [
                    { category: { eq: 'GROUP_PACKAGE' } },
                    { category: { eq: 'PERSONAL' } },
                  ],
                },
              ],
            },
            first: 100,
          },
          edges: {
            node: {
              id: true,
              name: true,
              visitsIncluded: true,
              validityDays: true,
              price: { amountMicros: true, currencyCode: true },
            },
          },
        },
      } as never)) as unknown as {
        studioProducts?: { edges?: Array<{ node: ProductOption }> };
      };
      const loadedProducts =
        result.studioProducts?.edges?.map(({ node }) => node) ?? [];
      setProducts(loadedProducts);
      setProductId(loadedProducts[0]?.id ?? '');
    } catch {
      await enqueueSnackbar({
        message: 'Не удалось загрузить доступные пакеты.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const close = () => {
    unmountFrontComponent();
    closeSidePanel();
  };

  const submit = async () => {
    if (personId === null || selectedProduct === null || paidAt === '') {
      return;
    }

    setSubmitting(true);
    try {
      const result =
        await new RestApiClient().post<ConfirmPackagePaymentResponse>(
          '/s/studio/package-payments/confirm',
          {
            personId,
            productId: selectedProduct.id,
            paidAt: new Date(paidAt).toISOString(),
            amount: selectedProduct.price.amountMicros / 1_000_000,
            paymentMethod,
            externalId: externalId.trim() || undefined,
            fiscalReceiptId: fiscalReceiptId.trim() || undefined,
            idempotencyKey,
          },
        );

      if (!result.success) {
        await enqueueSnackbar({ message: result.message, variant: 'error' });
        return;
      }

      await enqueueSnackbar({
        message: result.duplicate
          ? `Оплата уже была оформлена. Доступно: ${result.visitsAvailable}.`
          : `Пакет оформлен. Начислено: ${result.visitsAvailable}.`,
        variant: 'success',
      });
      close();
    } catch (error) {
      await enqueueSnackbar({
        message:
          error instanceof Error
            ? error.message
            : 'Не удалось оформить оплату пакета.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    personId !== null &&
    selectedProduct !== null &&
    paidAt !== '' &&
    !loading &&
    !submitting;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Оформить оплату пакета</h2>
        <p style={styles.subtitle}>
          Оплата создаст пакет и начислит посещения выбранному клиенту.
        </p>
      </div>

      <div style={styles.body}>
        <div style={styles.field}>
          <label htmlFor="package-product" style={styles.label}>
            Пакет
          </label>
          <select
            id="package-product"
            style={styles.control}
            value={productId}
            onChange={(event) => setProductId(readValue(event))}
            disabled={loading || submitting}
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — {formatPrice(product.price)}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label htmlFor="paid-at" style={styles.label}>
            Дата и время оплаты
          </label>
          <input
            id="paid-at"
            type="datetime-local"
            style={styles.control}
            value={paidAt}
            max={defaultPaidAt()}
            onChange={(event) => setPaidAt(readValue(event))}
            disabled={submitting}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="payment-method" style={styles.label}>
            Способ оплаты
          </label>
          <select
            id="payment-method"
            style={styles.control}
            value={paymentMethod}
            onChange={(event) =>
              setPaymentMethod(
                readValue(event) === 'CASH'
                  ? 'CASH'
                  : readValue(event) === 'CARD'
                    ? 'CARD'
                    : 'SBP',
              )
            }
            disabled={submitting}
          >
            <option value="SBP">СБП</option>
            <option value="CASH">Наличные</option>
            <option value="CARD">Карта</option>
          </select>
        </div>

        <div style={styles.field}>
          <label htmlFor="external-id" style={styles.label}>
            Внешний ID (необязательно)
          </label>
          <input
            id="external-id"
            style={styles.control}
            value={externalId}
            onChange={(event) => setExternalId(readValue(event))}
            disabled={submitting}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="receipt-id" style={styles.label}>
            ID чека (необязательно)
          </label>
          <input
            id="receipt-id"
            style={styles.control}
            value={fiscalReceiptId}
            onChange={(event) => setFiscalReceiptId(readValue(event))}
            disabled={submitting}
          />
        </div>

        {selectedProduct !== null ? (
          <div style={styles.summary}>
            <div>
              <strong>К оплате:</strong> {formatPrice(selectedProduct.price)}
            </div>
            <div>
              <strong>Будет начислено:</strong> {selectedProduct.visitsIncluded}
            </div>
            <div>
              <strong>Срок:</strong>{' '}
              {selectedProduct.validityDays
                ? `${selectedProduct.validityDays} дней с даты оплаты`
                : 'без заданного срока'}
            </div>
          </div>
        ) : null}
      </div>

      <div style={styles.footer}>
        <button
          type="button"
          style={{ ...styles.button, ...styles.secondaryButton }}
          onClick={close}
          disabled={submitting}
        >
          Отмена
        </button>
        <button
          type="button"
          style={{
            ...styles.button,
            ...styles.primaryButton,
            ...(canSubmit ? {} : styles.disabledButton),
          }}
          onClick={() => void submit()}
          disabled={!canSubmit}
        >
          {submitting ? 'Оформление…' : 'Подтвердить оплату'}
        </button>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    CONFIRM_PACKAGE_PAYMENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'confirm-package-payment',
  description: 'Create a paid client package and grant its visits.',
  component: ConfirmPackagePaymentForm,
});
