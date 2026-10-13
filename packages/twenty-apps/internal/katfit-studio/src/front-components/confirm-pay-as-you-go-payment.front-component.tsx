import { type CSSProperties, useCallback, useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  closeSidePanel,
  enqueueSnackbar,
  unmountFrontComponent,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';

export const CONFIRM_PAY_AS_YOU_GO_PAYMENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '8bc9489f-2d48-4b39-97f8-fb1d259d03e8';

type BookingContext = {
  paymentStatus: string;
  person: { name: { firstName: string | null; lastName: string | null } } | null;
  status: string;
};

type ConfirmResponse =
  | { success: true; duplicate: boolean }
  | { success: false; message: string };

const styles: Record<string, CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', color: 'var(--t-font-color-primary)', fontFamily: 'var(--t-font-family)' },
  header: { padding: 'var(--t-spacing-4)', borderBottom: '1px solid var(--t-border-color-light)' },
  body: { display: 'flex', flex: 1, flexDirection: 'column', gap: 'var(--t-spacing-3)', padding: 'var(--t-spacing-4)' },
  field: { display: 'flex', flexDirection: 'column', gap: 'var(--t-spacing-2)' },
  control: { height: 'var(--t-spacing-8)', padding: '0 var(--t-spacing-3)', color: 'var(--t-font-color-primary)', background: 'var(--t-background-secondary)', border: '1px solid var(--t-border-color-medium)', borderRadius: 'var(--t-border-radius-sm)' },
  summary: { padding: 'var(--t-spacing-3)', background: 'var(--t-background-secondary)', border: '1px solid var(--t-border-color-light)', borderRadius: 'var(--t-border-radius-sm)' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: 'var(--t-spacing-2)', padding: 'var(--t-spacing-3)', borderTop: '1px solid var(--t-border-color-light)' },
  button: { height: 'var(--t-spacing-8)', padding: '0 var(--t-spacing-3)', borderRadius: 'var(--t-border-radius-sm)', cursor: 'pointer' },
};

const defaultPaidAt = (): string => {
  const now = new Date();

  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

const getPersonName = (person: BookingContext['person']): string =>
  [person?.name.firstName, person?.name.lastName].filter(Boolean).join(' ') || 'Клиент';

const ConfirmPayAsYouGoPaymentForm = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const bookingId = selectedRecordIds.length === 1 ? selectedRecordIds[0] : null;
  const [booking, setBooking] = useState<BookingContext | null>(null);
  const [paidAt, setPaidAt] = useState(defaultPaidAt);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'SBP' | 'CARD'>('SBP');
  const [fiscalReceiptId, setFiscalReceiptId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const close = () => {
    unmountFrontComponent();
    closeSidePanel();
  };

  const loadBooking = useCallback(async () => {
    if (bookingId === null) return;

    setIsLoading(true);
    try {
      const result = (await new CoreApiClient().query({
        studioBookings: {
          __args: { filter: { id: { eq: bookingId } }, first: 1 },
          edges: { node: { paymentStatus: true, person: { name: { firstName: true, lastName: true } }, status: true } },
        },
      } as never)) as unknown as { studioBookings?: { edges?: Array<{ node: BookingContext }> } };

      setBooking(result.studioBookings?.edges?.[0]?.node ?? null);
    } catch {
      await enqueueSnackbar({ message: 'Не удалось загрузить запись.', variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void loadBooking();
  }, [loadBooking]);

  const submit = async () => {
    if (bookingId === null) return;

    setIsSubmitting(true);
    try {
      const result = await new RestApiClient().post<ConfirmResponse>(
        '/s/studio/bookings/confirm-pay-as-you-go-payment',
        {
          bookingId,
          fiscalReceiptId: fiscalReceiptId.trim() || undefined,
          paidAt: new Date(paidAt).toISOString(),
          paymentMethod,
        },
      );
      if (!result.success) {
        await enqueueSnackbar({ message: result.message, variant: 'error' });
        return;
      }

      await enqueueSnackbar({
        message: result.duplicate ? 'Оплата уже подтверждена.' : 'Оплата подтверждена.',
        variant: 'success',
      });
      close();
    } catch (error) {
      await enqueueSnackbar({
        message: error instanceof Error ? error.message : 'Не удалось подтвердить оплату.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !isLoading && !isSubmitting && bookingId !== null && booking?.status === 'ATTENDED' && booking.paymentStatus === 'EXPECTED' && paidAt !== '';

  return <div style={styles.container}>
    <div style={styles.header}>
      <h2>Подтвердить оплату</h2>
      <p>Оплата по факту доступна после отметки о посещении занятия.</p>
    </div>
    <div style={styles.body}>
      {booking !== null ? <div style={styles.summary}>Клиент: {getPersonName(booking.person)}<br />Статус посещения: {booking.status === 'ATTENDED' ? 'посетил' : booking.status}<br />Статус оплаты: {booking.paymentStatus === 'EXPECTED' ? 'ожидается' : booking.paymentStatus}</div> : null}
      <label style={styles.field}>Дата и время оплаты<input style={styles.control} type="datetime-local" value={paidAt} max={defaultPaidAt()} onChange={(event) => setPaidAt(event.target.value)} disabled={isSubmitting} /></label>
      <label style={styles.field}>Способ оплаты<select style={styles.control} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as 'CASH' | 'SBP' | 'CARD')} disabled={isSubmitting}><option value="SBP">СБП</option><option value="CASH">Наличные</option><option value="CARD">Карта</option></select></label>
      <label style={styles.field}>Номер чека (необязательно)<input style={styles.control} value={fiscalReceiptId} onChange={(event) => setFiscalReceiptId(event.target.value)} disabled={isSubmitting} /></label>
    </div>
    <div style={styles.footer}><button style={styles.button} type="button" onClick={close} disabled={isSubmitting}>Отмена</button><button style={styles.button} type="button" onClick={() => void submit()} disabled={!canSubmit}>{isSubmitting ? 'Подтверждение…' : 'Подтвердить оплату'}</button></div>
  </div>;
};

export default defineFrontComponent({
  universalIdentifier: CONFIRM_PAY_AS_YOU_GO_PAYMENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'confirm-pay-as-you-go-payment',
  description: 'Confirm an expected payment after attended pay-as-you-go booking.',
  component: ConfirmPayAsYouGoPaymentForm,
});
