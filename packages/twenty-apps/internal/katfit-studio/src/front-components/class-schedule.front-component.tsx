import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { escapeForIlike } from 'twenty-shared/utils';

import { SESSION_FORMAT_OPTIONS } from 'src/constants/select-options';

import { createIdempotencyKey } from 'src/front-components/utils/create-idempotency-key';

export const CLASS_SCHEDULE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '67c2f57f-2d8d-4b61-8a06-93a7f9070d75';

const GRID_START_HOUR = 6;
const GRID_END_HOUR = 22;
const HOUR_HEIGHT = 64;

type TrainerOption = { id: string; name: string; active: boolean };

type ClassSession = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  sessionFormat: string;
  status: string;
  bookedCount: number;
  capacity: number;
  trainer: TrainerOption | null;
};

type SessionForm = {
  operationKey: string;
  expected: Omit<ClassSession, 'id' | 'bookedCount' | 'trainer'> | null;
  id: string | null;
  productId: string;
  trainerId: string;
  trainerRequestKey: string;
  name: string;
  sessionFormat: string;
  startsAt: string;
  durationMinutes: string;
  capacity: string;
};

type ProductOption = {
  category: string;
  id: string;
  name: string;
  sessionFormat: string;
  durationMinutes: number;
  defaultSessionCapacity: number;
};

type SplitPairOption = {
  id: string;
  name: string;
  firstPerson: {
    name: { firstName: string | null; lastName: string | null } | null;
  } | null;
  secondPerson: {
    name: { firstName: string | null; lastName: string | null } | null;
  } | null;
  studioMemberships?: {
    edges?: Array<{
      node: { id: string; status: string; visitsAvailable: number };
    }>;
  } | null;
};

const getSplitPairLabel = (pair: SplitPairOption): string => {
  const getName = (person: SplitPairOption['firstPerson']): string =>
    `${person?.name?.firstName ?? ''} ${person?.name?.lastName ?? ''}`.trim() ||
    'Клиент не указан';

  return `${getName(pair.firstPerson)} — ${getName(pair.secondPerson)}`;
};

type Participant = {
  id: string;
  bookingType: string;
  membership: { id: string } | null;
  pair: { id: string } | null;
  person: {
    id: string;
    name: { firstName: string | null; lastName: string | null } | null;
  } | null;
  paymentStatus: string;
  status: string;
};

type PendingParticipant = {
  person: PersonOption;
  productId: string | null;
  paymentType: 'MEMBERSHIP' | 'PAY_AS_YOU_GO';
};

type PersonOption = {
  id: string;
  name: { firstName: string | null; lastName: string | null } | null;
  emails: { primaryEmail: string | null } | null;
  phones: { primaryPhoneNumber: string | null } | null;
  studioMemberships?: {
    edges?: Array<{
      node: MembershipOption;
    }>;
  } | null;
};

type MembershipOption = {
  id: string;
  status: string;
  activatedAt: string | null;
  expiresOn: string | null;
  visitsAvailable: number;
  product: {
    id: string;
    name: string;
    sessionFormat: string;
  } | null;
};

const styles: Record<string, CSSProperties> = {
  container: {
    background: 'var(--t-background-primary)',
    color: 'var(--t-font-color-primary)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--t-font-family)',
    height: '100%',
    overflow: 'hidden',
  },
  toolbar: {
    alignItems: 'center',
    borderBottom: '1px solid var(--t-border-color-light)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
  },
  title: { fontSize: 18, fontWeight: 600, marginRight: 'auto' },
  button: {
    background: 'var(--t-background-secondary)',
    border: '1px solid var(--t-border-color-medium)',
    borderRadius: 4,
    color: 'var(--t-font-color-primary)',
    cursor: 'pointer',
    minHeight: 32,
    padding: '4px 10px',
  },
  activeButton: {
    background: 'var(--t-color-blue)',
    border: '1px solid var(--t-color-blue)',
    borderRadius: 4,
    color: 'white',
    cursor: 'pointer',
    minHeight: 32,
    padding: '4px 10px',
  },
  gridScroll: { flex: 1, overflow: 'auto', padding: 12 },
  grid: { display: 'grid', width: '100%' },
  dayHeader: {
    alignItems: 'center',
    borderBottom: '1px solid var(--t-border-color-light)',
    borderLeft: '1px solid var(--t-border-color-light)',
    display: 'flex',
    fontSize: 12,
    justifyContent: 'center',
    minHeight: 40,
  },
  hourColumn: { position: 'relative' },
  hour: {
    color: 'var(--t-font-color-light)',
    fontSize: 12,
    position: 'absolute',
    right: 8,
    transform: 'translateY(-8px)',
  },
  dayColumn: {
    backgroundImage:
      'repeating-linear-gradient(to bottom, transparent 0, transparent 63px, var(--t-border-color-light) 63px, var(--t-border-color-light) 64px)',
    borderLeft: '1px solid var(--t-border-color-light)',
    position: 'relative',
  },
  session: {
    background: 'var(--t-background-secondary)',
    borderLeft: '3px solid var(--t-color-blue)',
    borderRadius: 4,
    boxSizing: 'border-box',
    color: 'var(--t-font-color-primary)',
    fontSize: 12,
    left: 4,
    overflow: 'hidden',
    padding: 6,
    position: 'absolute',
    right: 4,
    textAlign: 'left',
    zIndex: 1,
  },
  timeSlot: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    left: 0,
    padding: 0,
    position: 'absolute',
    right: 0,
  },
  formBackdrop: {
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.55)',
    display: 'flex',
    inset: 0,
    justifyContent: 'center',
    padding: 16,
    position: 'absolute',
    zIndex: 1,
  },
  form: {
    background: 'var(--t-background-primary)',
    border: '1px solid var(--t-border-color-medium)',
    borderRadius: 8,
    boxSizing: 'border-box',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
    display: 'grid',
    gap: 12,
    maxWidth: 380,
    padding: 16,
    width: '100%',
  },
  formLabel: { display: 'grid', fontSize: 13, gap: 4 },
  input: {
    background: 'var(--t-background-secondary)',
    border: '1px solid var(--t-border-color-medium)',
    borderRadius: 4,
    boxSizing: 'border-box',
    color: 'var(--t-font-color-primary)',
    minHeight: 32,
    padding: '4px 8px',
    width: '100%',
  },
  readOnlyValue: {
    color: 'var(--t-font-color-secondary)',
    minHeight: 32,
    padding: '6px 0',
  },
  formActions: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  participants: {
    borderTop: '1px solid var(--t-border-color-light)',
    display: 'grid',
    gap: 8,
    paddingTop: 12,
  },
  participant: {
    alignItems: 'center',
    display: 'flex',
    fontSize: 13,
    gap: 8,
    justifyContent: 'space-between',
  },
  smallButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--t-color-red)',
    cursor: 'pointer',
    padding: 2,
  },
  pickerBackdrop: {
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.55)',
    display: 'flex',
    inset: 0,
    justifyContent: 'center',
    padding: 16,
    position: 'absolute',
    zIndex: 2,
  },
  picker: {
    background: 'var(--t-background-primary)',
    border: '1px solid var(--t-border-color-medium)',
    borderRadius: 8,
    boxSizing: 'border-box',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    height: 'min(640px, calc(100% - 32px))',
    maxWidth: 460,
    padding: 16,
    width: '100%',
  },
  pickerResults: {
    alignContent: 'start',
    display: 'grid',
    flex: 1,
    gap: 8,
    minHeight: 0,
    overflowY: 'auto',
    paddingRight: 4,
  },
  searchResult: {
    background: 'var(--t-background-secondary)',
    border: '1px solid var(--t-border-color-light)',
    borderRadius: 4,
    color: 'var(--t-font-color-primary)',
    cursor: 'pointer',
    display: 'grid',
    gap: 2,
    padding: 10,
    textAlign: 'left',
  },
  contact: { color: 'var(--t-font-color-secondary)', fontSize: 12 },
  membershipAvailable: { color: 'var(--t-color-green)', fontSize: 12 },
  error: { color: 'var(--t-color-red)', padding: 16 },
  success: {
    background: 'var(--t-background-secondary)',
    border: '1px solid var(--t-color-green)',
    borderRadius: 4,
    color: 'var(--t-color-green)',
    margin: '0 12px',
    padding: 10,
  },
};

const startOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const dayOffset = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - dayOffset);
  result.setHours(0, 0, 0, 0);
  return result;
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const getSessionFormatLabel = (sessionFormat: string): string =>
  SESSION_FORMAT_OPTIONS.find(
    (sessionFormatOption) => sessionFormatOption.value === sessionFormat,
  )?.label ?? sessionFormat;

const toDateTimeLocalValue = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;

const getEndsAt = (
  startsAtValue: string,
  durationMinutesValue: string,
): Date => {
  const endsAt = new Date(startsAtValue);
  endsAt.setMinutes(endsAt.getMinutes() + Number(durationMinutesValue));
  return endsAt;
};

const getNewSessionForm = (startsAt: Date): SessionForm => {
  const endsAt = new Date(startsAt);
  endsAt.setHours(endsAt.getHours() + 1);

  return {
    id: null,
    operationKey: createIdempotencyKey(),
    expected: null,
    productId: '',
    trainerId: '',
    trainerRequestKey: crypto.randomUUID(),
    name: '',
    sessionFormat: SESSION_FORMAT_OPTIONS[0].value,
    startsAt: toDateTimeLocalValue(startsAt),
    durationMinutes: String((endsAt.getTime() - startsAt.getTime()) / 60_000),
    capacity: '4',
  };
};

const getSessionForm = (session: ClassSession): SessionForm => ({
  id: session.id,
  operationKey: createIdempotencyKey(),
  expected: {
    name: session.name,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    sessionFormat: session.sessionFormat,
    capacity: session.capacity,
    status: session.status,
  },
  productId: '',
  trainerId: session.trainer?.id ?? '',
  trainerRequestKey: crypto.randomUUID(),
  name: session.name,
  sessionFormat: session.sessionFormat,
  startsAt: toDateTimeLocalValue(new Date(session.startsAt)),
  durationMinutes: String(
    (new Date(session.endsAt).getTime() -
      new Date(session.startsAt).getTime()) /
      60_000,
  ),
  capacity: String(session.capacity),
});

const getPersonLabel = (
  person: PersonOption | Participant['person'],
): string => {
  const name =
    `${person?.name?.firstName ?? ''} ${person?.name?.lastName ?? ''}`.trim();
  return name || 'Без имени';
};

const getPersonContact = (person: PersonOption): string =>
  [person.phones?.primaryPhoneNumber, person.emails?.primaryEmail]
    .filter((contact): contact is string => Boolean(contact))
    .join(' · ') || 'Контакты не указаны';

const isActiveParticipant = (participant: Participant): boolean =>
  participant.status === 'BOOKED' || participant.status === 'ATTENDED';

const getMatchingMembership = (
  person: PersonOption,
  sessionForm: SessionForm,
): MembershipOption | null => {
  const sessionStartsAt = new Date(sessionForm.startsAt);
  if (Number.isNaN(sessionStartsAt.getTime())) return null;

  const sessionDate = sessionStartsAt.toISOString().slice(0, 10);

  return (
    person.studioMemberships?.edges
      ?.map(({ node }) => node)
      .find(
        (membership) =>
          membership.status === 'ACTIVE' &&
          membership.visitsAvailable > 0 &&
          membership.activatedAt !== null &&
          membership.activatedAt <= sessionStartsAt.toISOString() &&
          (membership.expiresOn === null ||
            membership.expiresOn >= sessionDate) &&
          (sessionForm.productId === '' ||
            membership.product?.id === sessionForm.productId) &&
          membership.product?.sessionFormat === sessionForm.sessionFormat,
      ) ?? null
  );
};

const getWeekDays = (selectedDate: Date, mode: 'day' | 'week'): Date[] =>
  mode === 'day'
    ? [startOfDay(selectedDate)]
    : Array.from({ length: 7 }, (_, index) =>
        addDays(startOfWeek(selectedDate), index),
      );

const ClassSchedule = () => {
  const [mode, setMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [trainers, setTrainers] = useState<TrainerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [splitPairs, setSplitPairs] = useState<SplitPairOption[]>([]);
  const [selectedSplitPairId, setSelectedSplitPairId] = useState('');
  const [isSplitPairLoading, setIsSplitPairLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] =
    useState(false);
  const createdSessions = useRef(
    new Map<string, { id: string; request: string }>(),
  );
  const [sessionForm, setSessionForm] = useState<SessionForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pendingParticipants, setPendingParticipants] = useState<
    PendingParticipant[]
  >([]);
  const [bookingPaymentType, setBookingPaymentType] = useState<
    'MEMBERSHIP' | 'PAY_AS_YOU_GO'
  >('MEMBERSHIP');
  const [payAsYouGoProductId, setPayAsYouGoProductId] = useState('');
  const [isPersonPickerOpen, setIsPersonPickerOpen] = useState(false);
  const [personSearch, setPersonSearch] = useState('');
  const [personResults, setPersonResults] = useState<PersonOption[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<PersonOption[]>([]);
  const [isPersonSearchLoading, setIsPersonSearchLoading] = useState(false);
  const [isParticipantsLoading, setIsParticipantsLoading] = useState(false);
  const [participantVersion, setParticipantVersion] = useState(0);
  const days = useMemo(
    () => getWeekDays(selectedDate, mode),
    [mode, selectedDate],
  );

  useEffect(() => {
    const firstDay = days[0];
    const lastDay = addDays(days[days.length - 1], 1);
    let isMounted = true;

    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = (await new CoreApiClient().query({
          classSessions: {
            __args: {
              filter: {
                and: [
                  { startsAt: { gte: firstDay.toISOString() } },
                  { startsAt: { lt: lastDay.toISOString() } },
                ],
              },
              first: 200,
            },
            edges: {
              node: {
                id: true,
                name: true,
                startsAt: true,
                endsAt: true,
                sessionFormat: true,
                status: true,
                bookedCount: true,
                capacity: true,
                trainer: { id: true, name: true, active: true },
              },
            },
          },
          studioTrainers: { __args: { first: 1000 }, edges: { node: { id: true, name: true, active: true } } },
          studioProducts: {
            __args: { filter: { isActive: { eq: true } }, first: 100 },
            edges: {
              node: {
                id: true,
                name: true,
                category: true,
                sessionFormat: true,
                durationMinutes: true,
                defaultSessionCapacity: true,
              },
            },
          },
        } as never)) as unknown as {
          classSessions?: { edges?: Array<{ node: ClassSession }> };
          studioProducts?: { edges?: Array<{ node: ProductOption }> };
          studioTrainers?: { edges?: Array<{ node: TrainerOption }> };
        };

        if (isMounted) {
          setSessions(
            response.classSessions?.edges
              ?.map(({ node }) => node)
              .filter((session) => session.status !== 'CANCELLED_BY_STUDIO') ??
              [],
          );
          if ((response.studioTrainers?.edges?.length ?? 0) >= 1000) throw new Error('Каталог тренеров слишком велик.');
          setTrainers(response.studioTrainers?.edges?.map(({ node }) => node).filter(({ active }) => active) ?? []);
          setProducts(
            response.studioProducts?.edges?.map(({ node }) => node) ?? [],
          );
        }
      } catch (loadError) {
        if (isMounted) {
          setError('Не удалось загрузить занятия.');
          await enqueueSnackbar({
            message:
              loadError instanceof Error
                ? loadError.message
                : 'Не удалось загрузить занятия.',
            variant: 'error',
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [days, reloadVersion]);

  const movePeriod = (offset: number) => {
    setSelectedDate(addDays(selectedDate, offset * (mode === 'day' ? 1 : 7)));
  };

  const activeParticipants = participants.filter(isActiveParticipant);
  const availablePersonSlots = Math.max(
    0,
    Number(sessionForm?.capacity ?? 0) -
      (sessionForm?.id === null
        ? pendingParticipants.length
        : activeParticipants.length),
  );
  const availablePersonResults = useMemo(() => {
    if (sessionForm === null) return [];

    return personResults
      .filter(
        (person) =>
          !activeParticipants.some(
            (participant) => participant.person?.id === person.id,
          ) &&
          !pendingParticipants.some(
            (pendingParticipant) => pendingParticipant.person.id === person.id,
          ) &&
          (bookingPaymentType === 'PAY_AS_YOU_GO'
            ? payAsYouGoProductId !== ''
            : getMatchingMembership(person, sessionForm) !== null),
      )
      .sort((firstPerson, secondPerson) =>
        getPersonLabel(firstPerson).localeCompare(
          getPersonLabel(secondPerson),
          'ru',
        ),
      );
  }, [
    activeParticipants,
    bookingPaymentType,
    payAsYouGoProductId,
    pendingParticipants,
    personResults,
    sessionForm,
  ]);
  const isFutureSession =
    sessionForm !== null &&
    new Date(sessionForm.startsAt).getTime() > Date.now();
  const selectedSplitPair = splitPairs.find(
    (pair) => pair.id === selectedSplitPairId,
  );
  const selectedSplitMembership = selectedSplitPair?.studioMemberships?.edges
    ?.map(({ node }) => node)
    .find(
      (membership) =>
        membership.status === 'ACTIVE' && membership.visitsAvailable > 0,
    );
  const loadParticipants = useCallback(async (classSessionId: string) => {
    setIsParticipantsLoading(true);
    try {
      const response = (await new CoreApiClient().query({
        studioBookings: {
          __args: {
            filter: { classSessionId: { eq: classSessionId } },
            first: 100,
          },
          edges: {
            node: {
              id: true,
              bookingType: true,
              paymentStatus: true,
              status: true,
              membership: { id: true },
              pair: { id: true },
              person: { id: true, name: { firstName: true, lastName: true } },
            },
          },
        },
      } as never)) as unknown as {
        studioBookings?: { edges?: Array<{ node: Participant }> };
      };
      setParticipants(
        response.studioBookings?.edges?.map(({ node }) => node) ?? [],
      );
    } catch (loadError) {
      await enqueueSnackbar({
        message:
          loadError instanceof Error
            ? loadError.message
            : 'Не удалось загрузить участников.',
        variant: 'error',
      });
    } finally {
      setIsParticipantsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionForm?.id === null || sessionForm === null) {
      setParticipants([]);
      return;
    }
    void loadParticipants(sessionForm.id);
  }, [loadParticipants, participantVersion, sessionForm?.id]);

  useEffect(() => {
    if (
      sessionForm === null ||
      sessionForm.sessionFormat !== 'SPLIT_EQUIPMENT'
    ) {
      setSplitPairs([]);
      setSelectedSplitPairId('');
      return;
    }
    void (async () => {
      setIsSplitPairLoading(true);
      try {
        const response = (await new CoreApiClient().query({
          studioPairs: {
            __args: { filter: { status: { eq: 'ACTIVE' } }, first: 100 },
            edges: {
              node: {
                id: true,
                name: true,
                firstPerson: { name: { firstName: true, lastName: true } },
                secondPerson: { name: { firstName: true, lastName: true } },
                studioMemberships: {
                  __args: { first: 100 },
                  edges: {
                    node: { id: true, status: true, visitsAvailable: true },
                  },
                },
              },
            },
          },
        } as never)) as unknown as {
          studioPairs?: { edges?: Array<{ node: SplitPairOption }> };
        };
        const loadedPairs =
          response.studioPairs?.edges
            ?.map(({ node }) => node)
            .filter((pair) =>
              pair.studioMemberships?.edges?.some(
                ({ node: membership }) =>
                  membership.status === 'ACTIVE' &&
                  membership.visitsAvailable > 0,
              ),
            ) ?? [];
        setSplitPairs(loadedPairs);
        setSelectedSplitPairId('');
      } catch {
        void enqueueSnackbar({
          message: 'Не удалось загрузить доступные пары.',
          variant: 'error',
        });
      } finally {
        setIsSplitPairLoading(false);
      }
    })();
  }, [participantVersion, sessionForm?.id, sessionForm?.sessionFormat]);

  const searchPeople = useCallback(async (searchTerm: string) => {
    setIsPersonSearchLoading(true);
    try {
      const normalizedSearchTerm = searchTerm.trim();
      const searchPattern = `%${escapeForIlike(normalizedSearchTerm)}%`;
      const response = (await new CoreApiClient().query({
        people: {
          __args: {
            filter:
              normalizedSearchTerm === ''
                ? {}
                : {
                    or: [
                      { name: { firstName: { ilike: searchPattern } } },
                      { name: { lastName: { ilike: searchPattern } } },
                      { emails: { primaryEmail: { ilike: searchPattern } } },
                      {
                        phones: {
                          primaryPhoneNumber: { ilike: searchPattern },
                        },
                      },
                    ],
                  },
            first: 100,
          },
          edges: {
            node: {
              id: true,
              name: { firstName: true, lastName: true },
              emails: { primaryEmail: true },
              phones: { primaryPhoneNumber: true },
              studioMemberships: {
                __args: { first: 100 },
                edges: {
                  node: {
                    id: true,
                    status: true,
                    activatedAt: true,
                    expiresOn: true,
                    visitsAvailable: true,
                    product: {
                      id: true,
                      name: true,
                      sessionFormat: true,
                    },
                  },
                },
              },
            },
          },
        },
      } as never)) as unknown as {
        people?: { edges?: Array<{ node: PersonOption }> };
      };
      setPersonResults(response.people?.edges?.map(({ node }) => node) ?? []);
    } catch (searchError) {
      void enqueueSnackbar({
        message:
          searchError instanceof Error
            ? searchError.message
            : 'Не удалось найти клиентов.',
        variant: 'error',
      });
    } finally {
      setIsPersonSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPersonPickerOpen) return;

    if (personSearch === '') {
      void searchPeople('');
      return;
    }

    const searchTimeout = window.setTimeout(() => {
      void searchPeople(personSearch);
    }, 300);

    return () => window.clearTimeout(searchTimeout);
  }, [isPersonPickerOpen, personSearch, searchPeople]);

  const createRegularBooking = async (
    person: PersonOption,
    classSessionId: string,
  ): Promise<boolean> => {
    if (sessionForm === null) return false;
    const membership = getMatchingMembership(person, sessionForm);
    if (membership === null || membership.product === null) {
      return false;
    }
    try {
      const result = await new RestApiClient().post<{
        message?: string;
        success: boolean;
      }>('/s/studio/bookings/create', {
        classSessionId,
        idempotencyKey: `regular-booking:${person.id}:${classSessionId}`,
        membershipId: membership.id,
        personId: person.id,
      });
      if (!result.success) {
        throw new Error(
          result.message ?? 'Не удалось зарезервировать посещение.',
        );
      }
      return true;
    } catch (saveError) {
      void enqueueSnackbar({
        message:
          saveError instanceof Error
            ? saveError.message
            : 'Не удалось добавить клиента.',
        variant: 'error',
      });
      return false;
    }
  };

  const createPayAsYouGoBooking = async (
    person: PersonOption,
    productId: string,
    classSessionId: string,
  ): Promise<boolean> => {
    try {
      const result = await new RestApiClient().post<{
        message?: string;
        success: boolean;
      }>('/s/studio/bookings/create-pay-as-you-go', {
        classSessionId,
        idempotencyKey: `pay-as-you-go:${person.id}:${classSessionId}`,
        personId: person.id,
        productId,
      });
      if (!result.success)
        throw new Error(result.message ?? 'Не удалось добавить клиента.');
      return true;
    } catch (saveError) {
      void enqueueSnackbar({
        message:
          saveError instanceof Error
            ? saveError.message
            : 'Не удалось добавить клиента.',
        variant: 'error',
      });
      return false;
    }
  };

  const toggleSelectedPerson = (person: PersonOption) => {
    const isSelected = selectedPeople.some(
      (selectedPerson) => selectedPerson.id === person.id,
    );

    if (isSelected) {
      setSelectedPeople((currentPeople) =>
        currentPeople.filter((currentPerson) => currentPerson.id !== person.id),
      );
      return;
    }

    if (selectedPeople.length >= availablePersonSlots) {
      void enqueueSnackbar({
        message: 'Нельзя выбрать больше клиентов, чем свободных мест.',
        variant: 'error',
      });
      return;
    }

    setSelectedPeople((currentPeople) => [...currentPeople, person]);
  };

  const addSelectedPeople = async () => {
    if (sessionForm === null || selectedPeople.length === 0) return;

    if (selectedPeople.length > availablePersonSlots) {
      await enqueueSnackbar({
        message: 'Недостаточно свободных мест на занятии.',
        variant: 'error',
      });
      return;
    }

    if (sessionForm.id === null) {
      setPendingParticipants((currentPeople) => [
        ...currentPeople,
        ...selectedPeople.map((person) => ({
          person,
          productId:
            bookingPaymentType === 'PAY_AS_YOU_GO' ? payAsYouGoProductId : null,
          paymentType: bookingPaymentType,
        })),
      ]);
      setSelectedPeople([]);
      setPersonSearch('');
      setPersonResults([]);
      setIsPersonPickerOpen(false);
      return;
    }

    for (const person of selectedPeople) {
      const wasAdded =
        bookingPaymentType === 'PAY_AS_YOU_GO'
          ? await createPayAsYouGoBooking(
              person,
              payAsYouGoProductId,
              sessionForm.id,
            )
          : await createRegularBooking(person, sessionForm.id);
      if (!wasAdded) return;
    }

    setSelectedPeople([]);
    setPersonSearch('');
    setPersonResults([]);
    setIsPersonPickerOpen(false);
    setParticipantVersion(
      (currentParticipantVersion) => currentParticipantVersion + 1,
    );
    setReloadVersion((currentReloadVersion) => currentReloadVersion + 1);
  };

  const createSplitBooking = async (
    classSessionId: string,
  ): Promise<boolean> => {
    if (
      selectedSplitPair === undefined ||
      selectedSplitMembership === undefined
    ) {
      return false;
    }
    try {
      const response = await new RestApiClient().post<{
        success: boolean;
        message?: string;
      }>('/s/studio/split-bookings/create', {
        pairId: selectedSplitPair.id,
        membershipId: selectedSplitMembership.id,
        classSessionId,
        idempotencyKey: `schedule-split:${selectedSplitPair.id}:${classSessionId}`,
      });
      if (!response.success) {
        void enqueueSnackbar({
          message: response.message ?? 'Не удалось добавить сплит.',
          variant: 'error',
        });
        return false;
      }
      setParticipantVersion((version) => version + 1);
      setReloadVersion((version) => version + 1);
      return true;
    } catch (error) {
      await enqueueSnackbar({
        message:
          error instanceof Error ? error.message : 'Не удалось добавить сплит.',
        variant: 'error',
      });
      return false;
    }
  };

  const cancellationRequests = useRef<
    Record<string, { cancelledAt: string; idempotencyKey: string }>
  >({});
  const cancelSession = async () => {
    if (sessionForm?.id === null || sessionForm === null || !isFutureSession) {
      return;
    }
    setSuccessMessage('Отменяем занятие…');
    setIsSaving(true);
    try {
      const request = cancellationRequests.current[sessionForm.id] ?? {
        cancelledAt: new Date().toISOString(),
        idempotencyKey: `schedule-session-cancel:${createIdempotencyKey()}`,
      };
      cancellationRequests.current[sessionForm.id] = request;
      const result = await new RestApiClient().post<{
        success: boolean;
        message?: string;
      }>('/s/studio/sessions/cancel', {
        classSessionId: sessionForm.id,
        ...request,
      });
      if (!result.success)
        throw new Error(
          result.message ?? 'Не удалось подтвердить отмену занятия.',
        );
      setSessionForm(null);
      setParticipantVersion((version) => version + 1);
      setReloadVersion((version) => version + 1);
      setSuccessMessage('Занятие отменено и скрыто из расписания.');
      void enqueueSnackbar({
        message: 'Занятие отменено и скрыто из расписания.',
        variant: 'success',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось отменить занятие.';
      setSuccessMessage(`Ошибка: ${message}`);
      void enqueueSnackbar({
        message,
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const gridTemplateColumns =
    mode === 'week'
      ? '56px repeat(7, minmax(0, 1fr))'
      : '56px minmax(180px, 1fr)';
  const gridHeight = (GRID_END_HOUR - GRID_START_HOUR) * HOUR_HEIGHT;

  const openNewSessionForm = (day: Date, clickedHour: number) => {
    const startsAt = new Date(day);
    startsAt.setHours(clickedHour, 0, 0, 0);
    setPendingParticipants([]);
    setSessionForm(getNewSessionForm(startsAt));
  };

  const saveSession = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sessionForm === null) return;

    const startsAt = new Date(sessionForm.startsAt);
    const durationMinutes = Number(sessionForm.durationMinutes);
    const endsAt = getEndsAt(sessionForm.startsAt, sessionForm.durationMinutes);
    const capacity = Number(sessionForm.capacity);
    if (
      Number.isNaN(startsAt.getTime()) ||
      Number.isNaN(endsAt.getTime()) ||
      !Number.isInteger(durationMinutes) ||
      durationMinutes < 1 ||
      !Number.isInteger(capacity) ||
      capacity < 1
    ) {
      await enqueueSnackbar({
        message: 'Укажите корректные длительность и вместимость.',
        variant: 'error',
      });
      return;
    }
    const shouldAssignSplit =
      sessionForm.sessionFormat === 'SPLIT_EQUIPMENT' &&
      selectedSplitPair !== undefined;
    const currentParticipantCount =
      sessionForm.id === null
        ? pendingParticipants.length
        : activeParticipants.length;
    const requiredCapacity =
      currentParticipantCount + (shouldAssignSplit ? 2 : 0);
    if (requiredCapacity > capacity) {
      await enqueueSnackbar({
        message: 'Вместимость не может быть меньше числа добавляемых клиентов.',
        variant: 'error',
      });
      return;
    }
    const hasScheduleConflict = sessions.some((session) => {
      const sessionStartsAt = new Date(session.startsAt);
      const sessionEndsAt = new Date(session.endsAt);

      return (
        session.id !== sessionForm.id &&
        session.status !== 'CANCELLED_BY_STUDIO' &&
        sessionStartsAt < endsAt &&
        sessionEndsAt > startsAt
      );
    });
    if (hasScheduleConflict) {
      await enqueueSnackbar({
        message: 'Это время уже занято другим занятием.',
        variant: 'error',
      });
      return;
    }

    const name =
      sessionForm.name.trim() ||
      getSessionFormatLabel(sessionForm.sessionFormat);
    const data = {
      name,
      sessionFormat: sessionForm.sessionFormat,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      capacity,
    };

    setIsSaving(true);
    try {
      const rest = new RestApiClient();
      if (sessionForm.id === null) {
        const creationRequest = JSON.stringify({ ...data, trainerId: sessionForm.trainerId });
        const created = createdSessions.current.get(sessionForm.operationKey);
        if (created && created.request !== creationRequest)
          throw new Error(
            'Занятие уже создано в предыдущей попытке. Обновите расписание и откройте его для редактирования.',
          );
        let classSessionId = created?.id;
        if (!classSessionId) {
          const response = await rest.post<{
            success: boolean;
            classSessionId?: string;
            message?: string;
          }>('/s/studio/sessions/create', {
            name,
            sessionFormat: data.sessionFormat,
            startsAt: data.startsAt,
            durationMinutes,
            capacity,
            status: 'PLANNED',
            trainerId: sessionForm.trainerId || undefined,
            idempotencyKey: sessionForm.operationKey,
          });
          if (!response.success || !response.classSessionId)
            throw new Error(
              response.message ??
                'Создание занятия не подтверждено. Повторите с той же формой.',
            );
          classSessionId = response.classSessionId;
          createdSessions.current.set(sessionForm.operationKey, {
            id: classSessionId,
            request: creationRequest,
          });
        }
        if (shouldAssignSplit) {
          const isSplitAdded = await createSplitBooking(classSessionId);
          if (!isSplitAdded) {
            return;
          }
        } else {
          for (const participant of pendingParticipants) {
            const wasAdded =
              participant.paymentType === 'PAY_AS_YOU_GO' &&
              participant.productId !== null
                ? await createPayAsYouGoBooking(
                    participant.person,
                    participant.productId,
                    classSessionId,
                  )
                : await createRegularBooking(
                    participant.person,
                    classSessionId,
                  );
            if (!wasAdded) {
              return;
            }
          }
        }
        setPendingParticipants([]);
        setSessionForm(null);
      } else {
        const assignedTrainer = sessions.find((session) => session.id === sessionForm.id)?.trainer;
        if (!sessionForm.trainerId && assignedTrainer) throw new Error('Выберите тренера на замену.');
        if (sessionForm.trainerId && sessionForm.trainerId !== assignedTrainer?.id) {
          const assignment = await rest.post<{ success: boolean; message?: string }>('/s/studio/sessions/assign-trainer', { classSessionId: sessionForm.id, trainerId: sessionForm.trainerId, requestKey: sessionForm.trainerRequestKey });
          if (!assignment.success) throw new Error(assignment.message ?? 'Назначение тренера не подтверждено.');
        }
        const response = await rest.post<{
          success: boolean;
          message?: string;
        }>('/s/studio/sessions/update', {
          classSessionId: sessionForm.id,
          idempotencyKey: sessionForm.operationKey,
          expected: sessionForm.expected,
          target: data,
        });
        if (!response.success)
          throw new Error(
            response.message ??
              'Изменение занятия не подтверждено. Обновите расписание или проверьте журнал операции.',
          );
        if (shouldAssignSplit) {
          const isSplitAdded = await createSplitBooking(sessionForm.id);
          if (!isSplitAdded) {
            return;
          }
        }
        setSessionForm(null);
      }
      setReloadVersion((currentReloadVersion) => currentReloadVersion + 1);
      await enqueueSnackbar({
        message:
          sessionForm.id === null
            ? shouldAssignSplit
              ? 'Занятие создано, сплит назначен.'
              : 'Занятие создано, клиенты назначены.'
            : shouldAssignSplit
              ? 'Занятие сохранено, сплит назначен.'
              : 'Занятие обновлено.',
        variant: 'success',
      });
    } catch (saveError) {
      await enqueueSnackbar({
        message:
          saveError instanceof Error
            ? saveError.message
            : 'Не удалось сохранить занятие.',
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        <div style={styles.title}>Расписание занятий</div>
        <button
          style={styles.button}
          type="button"
          onClick={() => movePeriod(-1)}
        >
          ←
        </button>
        <button
          style={styles.button}
          type="button"
          onClick={() => setSelectedDate(new Date())}
        >
          Сегодня
        </button>
        <button
          style={styles.button}
          type="button"
          onClick={() => movePeriod(1)}
        >
          →
        </button>
        <button
          style={mode === 'day' ? styles.activeButton : styles.button}
          type="button"
          onClick={() => setMode('day')}
        >
          День
        </button>
        <button
          style={mode === 'week' ? styles.activeButton : styles.button}
          type="button"
          onClick={() => setMode('week')}
        >
          Неделя
        </button>
      </div>
      <div style={styles.gridScroll}>
        {error ? <div style={styles.error}>{error}</div> : null}
        <div
          style={{
            ...styles.grid,
            gridTemplateColumns,
            gridTemplateRows: `40px ${gridHeight}px`,
          }}
        >
          <div />
          {days.map((day) => (
            <div key={toDateKey(day)} style={styles.dayHeader}>
              {day.toLocaleDateString('ru-RU', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </div>
          ))}
          <div style={{ ...styles.hourColumn, height: gridHeight }}>
            {Array.from(
              { length: GRID_END_HOUR - GRID_START_HOUR + 1 },
              (_, index) => (
                <span
                  key={index}
                  style={{ ...styles.hour, top: index * HOUR_HEIGHT }}
                >
                  {String(GRID_START_HOUR + index).padStart(2, '0')}:00
                </span>
              ),
            )}
          </div>
          {days.map((day) => {
            const dayKey = toDateKey(day);
            return (
              <div
                key={dayKey}
                style={{ ...styles.dayColumn, height: gridHeight }}
              >
                {Array.from(
                  { length: GRID_END_HOUR - GRID_START_HOUR },
                  (_, index) => (
                    <button
                      key={index}
                      aria-label={`Создать занятие в ${String(GRID_START_HOUR + index).padStart(2, '0')}:00`}
                      style={{
                        ...styles.timeSlot,
                        height: HOUR_HEIGHT,
                        top: index * HOUR_HEIGHT,
                      }}
                      type="button"
                      onClick={() =>
                        openNewSessionForm(day, GRID_START_HOUR + index)
                      }
                    />
                  ),
                )}
                {sessions
                  .filter(
                    (session) =>
                      toDateKey(new Date(session.startsAt)) === dayKey,
                  )
                  .map((session) => {
                    const startsAt = new Date(session.startsAt);
                    const endsAt = new Date(session.endsAt);
                    const top = Math.max(
                      0,
                      (startsAt.getHours() +
                        startsAt.getMinutes() / 60 -
                        GRID_START_HOUR) *
                        HOUR_HEIGHT,
                    );
                    const height = Math.max(
                      36,
                      ((endsAt.getTime() - startsAt.getTime()) / 3_600_000) *
                        HOUR_HEIGHT,
                    );
                    const startsAtLabel = startsAt.toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const sessionFormatLabel = getSessionFormatLabel(
                      session.sessionFormat,
                    );
                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSessionForm(getSessionForm(session));
                        }}
                        style={{ ...styles.session, top, height }}
                        data-tooltip={`${sessionFormatLabel} · ${startsAtLabel} · ${session.bookedCount}/${session.capacity}`}
                      >
                        <strong>{sessionFormatLabel}</strong>
                        <br />
                        {startsAtLabel} · {session.bookedCount}/
                        {session.capacity}
                      </button>
                    );
                  })}
              </div>
            );
          })}
        </div>
        {isLoading ? (
          <div style={{ padding: 12 }}>Загрузка расписания…</div>
        ) : null}
      </div>
      {successMessage !== null ? (
        <div role="status" style={styles.success}>
          {successMessage}
        </div>
      ) : null}
      {sessionForm !== null ? (
        <div style={styles.formBackdrop}>
          <form
            style={styles.form}
            onSubmit={(event) => void saveSession(event)}
          >
            <strong>
              {sessionForm.id === null
                ? 'Новое занятие'
                : 'Редактировать занятие'}
            </strong>
            <label style={styles.formLabel}>
              Название
              <input
                style={styles.input}
                value={sessionForm.name}
                onChange={(event) =>
                  setSessionForm({ ...sessionForm, name: event.target.value })
                }
              />
            </label>
            <label style={styles.formLabel}>Тренер
              <select style={styles.input} value={sessionForm.trainerId} onChange={(event) => setSessionForm({ ...sessionForm, trainerId: event.target.value, trainerRequestKey: crypto.randomUUID() })}>
                <option value="">Выбрать перед закрытием занятия</option>
                {sessionForm.trainerId && !trainers.some((trainer) => trainer.id === sessionForm.trainerId) && <option value={sessionForm.trainerId}>{sessions.find((session) => session.id === sessionForm.id)?.trainer?.name ?? 'Текущий тренер'} (неактивен)</option>}
                {trainers.map((trainer) => <option key={trainer.id} value={trainer.id}>{trainer.name}</option>)}
              </select>
            </label>
            {sessionForm.id === null ? (
              <label style={styles.formLabel}>
                Продукт-источник
                <select
                  style={styles.input}
                  value={sessionForm.productId}
                  onChange={(event) => {
                    const product = products.find(
                      (item) => item.id === event.target.value,
                    );
                    setSessionForm({
                      ...sessionForm,
                      productId: event.target.value,
                      name: sessionForm.name || product?.name || '',
                      sessionFormat:
                        product?.sessionFormat || sessionForm.sessionFormat,
                      durationMinutes: String(
                        product?.durationMinutes || sessionForm.durationMinutes,
                      ),
                      capacity: String(
                        product?.defaultSessionCapacity || sessionForm.capacity,
                      ),
                    });
                  }}
                >
                  <option value="">Настроить вручную</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label style={styles.formLabel}>
              Формат
              <select
                style={styles.input}
                value={sessionForm.sessionFormat}
                onChange={(event) => {
                  const sessionFormat = event.target.value;
                  const product = products.find(
                    (item) => item.sessionFormat === sessionFormat,
                  );
                  setSessionForm({
                    ...sessionForm,
                    productId: product?.id ?? '',
                    sessionFormat,
                    durationMinutes: String(
                      product?.durationMinutes ?? sessionForm.durationMinutes,
                    ),
                    capacity: String(
                      product?.defaultSessionCapacity ?? sessionForm.capacity,
                    ),
                  });
                }}
              >
                {SESSION_FORMAT_OPTIONS.map((sessionFormatOption) => (
                  <option
                    key={sessionFormatOption.value}
                    value={sessionFormatOption.value}
                  >
                    {sessionFormatOption.label}
                  </option>
                ))}
              </select>
            </label>
            <label style={styles.formLabel}>
              Начало
              <input
                style={styles.input}
                type="datetime-local"
                value={sessionForm.startsAt}
                onChange={(event) =>
                  setSessionForm({
                    ...sessionForm,
                    startsAt: event.target.value,
                  })
                }
                required
              />
            </label>
            <label style={styles.formLabel}>
              Длительность, мин.
              <input
                style={styles.input}
                type="number"
                min="1"
                step="5"
                value={sessionForm.durationMinutes}
                onChange={(event) =>
                  setSessionForm({
                    ...sessionForm,
                    durationMinutes: event.target.value,
                  })
                }
                required
              />
            </label>
            <label style={styles.formLabel}>
              Окончание
              <span style={styles.readOnlyValue}>
                {Number.isNaN(
                  getEndsAt(
                    sessionForm.startsAt,
                    sessionForm.durationMinutes,
                  ).getTime(),
                )
                  ? 'Укажите начало и длительность'
                  : getEndsAt(
                      sessionForm.startsAt,
                      sessionForm.durationMinutes,
                    ).toLocaleString('ru-RU', {
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'short',
                    })}
              </span>
            </label>
            <label style={styles.formLabel}>
              Вместимость
              <input
                style={styles.input}
                type="number"
                min="1"
                step="1"
                value={sessionForm.capacity}
                onChange={(event) =>
                  setSessionForm({
                    ...sessionForm,
                    capacity: event.target.value,
                  })
                }
                required
              />
            </label>
            <div style={styles.participants}>
              <strong>
                Участники ·{' '}
                {sessionForm.id === null
                  ? pendingParticipants.length
                  : activeParticipants.length}
                /{sessionForm.capacity || '—'}
              </strong>
              {sessionForm.id === null
                ? pendingParticipants.map((participant) => (
                    <div key={participant.person.id} style={styles.participant}>
                      <span>
                        {getPersonLabel(participant.person)}
                        {participant.paymentType === 'PAY_AS_YOU_GO'
                          ? ' · оплата ожидается'
                          : ''}
                      </span>
                      <button
                        style={styles.smallButton}
                        type="button"
                        onClick={() =>
                          setPendingParticipants((currentParticipants) =>
                            currentParticipants.filter(
                              (currentParticipant) =>
                                currentParticipant.person.id !==
                                participant.person.id,
                            ),
                          )
                        }
                      >
                        Убрать
                      </button>
                    </div>
                  ))
                : null}
              {sessionForm.id !== null && isParticipantsLoading ? (
                <span>Загрузка участников…</span>
              ) : null}
              {sessionForm.id !== null && !isParticipantsLoading
                ? activeParticipants.map((participant) => (
                    <div key={participant.id} style={styles.participant}>
                      <span>
                        {getPersonLabel(participant.person)}
                        {participant.paymentStatus === 'EXPECTED'
                          ? ' · оплата ожидается'
                          : ''}
                      </span>
                    </div>
                  ))
                : null}
              {sessionForm.id !== null &&
              !isParticipantsLoading &&
              activeParticipants.length === 0 ? (
                <span>Участников пока нет.</span>
              ) : null}
              {sessionForm.sessionFormat === 'SPLIT_EQUIPMENT' ? (
                <>
                  <strong>Доступные сплиты</strong>
                  {isSplitPairLoading ? <span>Загрузка пар…</span> : null}
                  {!isSplitPairLoading && splitPairs.length === 0 ? (
                    <span>
                      Нет пар с активным сплит-блоком и доступным остатком.
                    </span>
                  ) : null}
                  {splitPairs.length > 0 ? (
                    <>
                      <select
                        style={styles.input}
                        value={selectedSplitPairId}
                        onChange={(event) =>
                          setSelectedSplitPairId(event.target.value)
                        }
                        disabled={isSplitPairLoading}
                      >
                        <option value="">Выберите пару для записи</option>
                        {splitPairs.map((pair) => {
                          const membership = pair.studioMemberships?.edges
                            ?.map(({ node }) => node)
                            .find(
                              (item) =>
                                item.status === 'ACTIVE' &&
                                item.visitsAvailable > 0,
                            );
                          return (
                            <option key={pair.id} value={pair.id}>
                              {getSplitPairLabel(pair)} ·{' '}
                              {membership?.visitsAvailable ?? 0} доступно
                            </option>
                          );
                        })}
                      </select>
                      {selectedSplitPair !== undefined &&
                      selectedSplitMembership === undefined ? (
                        <span>
                          У выбранной пары нет активного общего блока с
                          доступным остатком.
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </>
              ) : null}
              {sessionForm.sessionFormat !== 'SPLIT_EQUIPMENT' &&
              (sessionForm.id === null
                ? pendingParticipants.length
                : activeParticipants.length) < Number(sessionForm.capacity) ? (
                <button
                  style={styles.button}
                  type="button"
                  onClick={() => {
                    setSelectedPeople([]);
                    setIsPersonPickerOpen(true);
                  }}
                >
                  Добавить клиента
                </button>
              ) : null}
            </div>
            {successMessage !== null ? (
              <span
                role="status"
                style={{
                  color: successMessage.startsWith('Ошибка:')
                    ? 'var(--t-color-red)'
                    : 'var(--t-color-green)',
                }}
              >
                {successMessage}
              </span>
            ) : null}
            {isCancelConfirmationOpen ? (
              <div style={styles.participants}>
                <strong>Отменить занятие?</strong>
                <span>
                  Все записи будут отменены, а слот исчезнет из расписания.
                </span>
                <div style={styles.formActions}>
                  <button
                    style={styles.button}
                    type="button"
                    onClick={() => setIsCancelConfirmationOpen(false)}
                  >
                    Не отменять
                  </button>
                  <button
                    style={styles.smallButton}
                    type="button"
                    onClick={() => {
                      setIsCancelConfirmationOpen(false);
                      void cancelSession();
                    }}
                  >
                    Да, отменить
                  </button>
                </div>
              </div>
            ) : null}
            <div style={styles.formActions}>
              {sessionForm.id !== null && isFutureSession ? (
                <button
                  style={styles.smallButton}
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsCancelConfirmationOpen(true)}
                >
                  {isSaving ? 'Отмена…' : 'Отменить занятие'}
                </button>
              ) : null}
              <button
                style={styles.button}
                type="button"
                onClick={() => setSessionForm(null)}
                disabled={isSaving}
              >
                Отмена
              </button>
              <button
                style={styles.activeButton}
                type="submit"
                disabled={isSaving}
              >
                {isSaving
                  ? 'Сохранение…'
                  : sessionForm.id === null
                    ? 'Создать занятие'
                    : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
      {isPersonPickerOpen && sessionForm !== null ? (
        <div style={styles.pickerBackdrop}>
          <div style={styles.picker}>
            <strong>Добавить клиента</strong>
            <label style={styles.formLabel}>
              Способ записи
              <select
                style={styles.input}
                value={bookingPaymentType}
                onChange={(event) =>
                  setBookingPaymentType(
                    event.target.value as 'MEMBERSHIP' | 'PAY_AS_YOU_GO',
                  )
                }
              >
                <option value="MEMBERSHIP">По пакету</option>
                <option value="PAY_AS_YOU_GO">Оплата по факту</option>
              </select>
            </label>
            {bookingPaymentType === 'PAY_AS_YOU_GO' ? (
              <label style={styles.formLabel}>
                Услуга
                <select
                  style={styles.input}
                  value={payAsYouGoProductId}
                  onChange={(event) =>
                    setPayAsYouGoProductId(event.target.value)
                  }
                >
                  <option value="">Выберите услугу</option>
                  {products
                    .filter(
                      (product) =>
                        ['SINGLE', 'PERSONAL'].includes(product.category) &&
                        product.sessionFormat === sessionForm.sessionFormat,
                    )
                    .map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                </select>
              </label>
            ) : null}
            <input
              autoFocus
              placeholder="Имя, телефон или email"
              style={styles.input}
              value={personSearch}
              onChange={(event) => setPersonSearch(event.target.value)}
            />
            <div style={styles.pickerResults}>
              {isPersonSearchLoading ? <span>Загрузка клиентов…</span> : null}
              {!isPersonSearchLoading
                ? availablePersonResults.map((person) => {
                    const membership = getMatchingMembership(
                      person,
                      sessionForm,
                    );
                    const isSelected = selectedPeople.some(
                      (selectedPerson) => selectedPerson.id === person.id,
                    );

                    return (
                      <label key={person.id} style={styles.searchResult}>
                        <span>
                          <input
                            checked={isSelected}
                            disabled={
                              (!isSelected &&
                                selectedPeople.length >=
                                  availablePersonSlots) ||
                              (bookingPaymentType === 'PAY_AS_YOU_GO' &&
                                payAsYouGoProductId === '')
                            }
                            type="checkbox"
                            onChange={() => toggleSelectedPerson(person)}
                          />{' '}
                          <strong>{getPersonLabel(person)}</strong>
                        </span>
                        <span style={styles.contact}>
                          {getPersonContact(person)}
                        </span>
                        <span style={styles.membershipAvailable}>
                          {bookingPaymentType === 'PAY_AS_YOU_GO'
                            ? 'Оплата будет ожидаться после занятия'
                            : `${membership?.product?.name} · доступно: ${membership?.visitsAvailable}`}
                        </span>
                      </label>
                    );
                  })
                : null}
              {!isPersonSearchLoading && availablePersonResults.length === 0 ? (
                <span>Подходящие клиенты не найдены.</span>
              ) : null}
            </div>
            <div style={styles.formActions}>
              <button
                style={styles.button}
                type="button"
                onClick={() => {
                  setSelectedPeople([]);
                  setIsPersonPickerOpen(false);
                  setPersonSearch('');
                  setPersonResults([]);
                }}
              >
                Закрыть
              </button>
              <button
                style={styles.activeButton}
                type="button"
                disabled={selectedPeople.length === 0}
                onClick={() => void addSelectedPeople()}
              >
                Добавить выбранных ({selectedPeople.length})
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: CLASS_SCHEDULE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'class-schedule',
  description: 'Почасовое расписание занятий',
  component: ClassSchedule,
});
