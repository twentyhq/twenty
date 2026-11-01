import { isObject, isString } from '@sniptt/guards';

import { SESSION_FORMAT_OPTIONS } from 'src/constants/select-options';

type InputProperty = {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  properties?: Record<string, InputProperty>;
  required?: string[];
  additionalProperties?: boolean;
  items?: InputProperty;
};

const IDENTIFIER: InputProperty = {
  type: 'string',
  description: 'Полный UUID существующей записи CRM, не сокращённый префикс.',
};
const IDEMPOTENCY_KEY: InputProperty = {
  type: 'string',
  description:
    'Непустой стабильный ключ до 200 символов. Для повтора сохранять ключ и все параметры; не менять ключ после неизвестного результата.',
};
const SESSION_FORMAT: InputProperty = {
  type: 'string',
  enum: SESSION_FORMAT_OPTIONS.map((option) => option.value),
};
const STARTS_AT: InputProperty = {
  type: 'string',
  description: 'ISO 8601 с Z или явным смещением; время студии Europe/Moscow.',
};
const DURATION: InputProperty = { type: 'integer', minimum: 1, maximum: 1440 };
const objectSchema = (
  properties: Record<string, InputProperty>,
  required: string[],
): InputProperty & { type: 'object' } => ({
  type: 'object',
  properties,
  required,
  additionalProperties: false,
});

export const STUDIO_TOOL_SCHEMAS = {
  publishTrainerPayRate: objectSchema({ payRateId: IDENTIFIER }, ['payRateId']),
  assignSessionTrainer: objectSchema({ classSessionId: IDENTIFIER, trainerId: IDENTIFIER, requestKey: { type: 'string', description: 'Стабильный UUID операции; сохранять при повторе.' } }, ['classSessionId', 'trainerId', 'requestKey']),
  closeTrainerCompensation: objectSchema({
    classSessionId: IDENTIFIER, trainerId: IDENTIFIER, requestKey: IDEMPOTENCY_KEY,
    previewOnly: { type: 'boolean' }, previewToken: { type: 'string' }, previousEntryId: IDENTIFIER, reason: { type: 'string' },
    attendanceCorrections: { type: 'array', items: objectSchema({ bookingId: IDENTIFIER, status: { type: 'string', enum: ['ATTENDED', 'NO_SHOW', 'LATE_CANCEL'] } }, ['bookingId', 'status']) },
  }, ['classSessionId', 'requestKey']),
  trainerCompensationSummary: objectSchema({ trainerId: IDENTIFIER, startsAt: STARTS_AT, endsAt: STARTS_AT }, ['trainerId', 'startsAt', 'endsAt']),
  createSession: objectSchema(
    {
      name: { type: 'string' },
      trainerId: IDENTIFIER,
      sessionFormat: SESSION_FORMAT,
      startsAt: STARTS_AT,
      durationMinutes: DURATION,
      capacity: { type: 'integer', minimum: 1, maximum: 100 },
      status: { type: 'string', enum: ['PLANNED', 'CONFIRMED', 'COMPLETED'] },
      pastConfirmed: { type: 'boolean' },
      idempotencyKey: IDEMPOTENCY_KEY,
      attendanceReason: { type: 'string' },
      participants: {
        type: 'array',
        description:
          'Уникальные клиенты: personId + membershipId либо personId + productId + paymentId. Не смешивать оба способа.',
        items: objectSchema(
          {
            personId: IDENTIFIER,
            membershipId: IDENTIFIER,
            productId: IDENTIFIER,
            paymentId: IDENTIFIER,
          },
          ['personId'],
        ),
      },
    },
    [
      'sessionFormat',
      'startsAt',
      'durationMinutes',
      'capacity',
      'status',
      'idempotencyKey',
    ],
  ),
  createSessionPayment: objectSchema(
    {
      personId: IDENTIFIER,
      productId: IDENTIFIER,
      sessionFormat: {
        ...SESSION_FORMAT,
        enum: SESSION_FORMAT.enum?.filter(
          (format) => format !== 'SPLIT_EQUIPMENT',
        ),
      },
      startsAt: STARTS_AT,
      durationMinutes: DURATION,
      status: { type: 'string', enum: ['PLANNED', 'COMPLETED'] },
      paymentMethod: { type: 'string', enum: ['CASH', 'SBP', 'CARD'] },
      paymentReceivedConfirmed: {
        type: 'boolean',
        description:
          'Для COMPLETED требуется true после явного подтверждения получения денег оператором. Для будущего EXPECTED не требуется.',
      },
      idempotencyKey: IDEMPOTENCY_KEY,
    },
    [
      'personId',
      'productId',
      'sessionFormat',
      'startsAt',
      'durationMinutes',
      'status',
      'paymentMethod',
      'idempotencyKey',
    ],
  ),
  createRegularBooking: objectSchema(
    {
      classSessionId: IDENTIFIER,
      personId: IDENTIFIER,
      membershipId: IDENTIFIER,
      idempotencyKey: IDEMPOTENCY_KEY,
    },
    ['classSessionId', 'personId', 'membershipId', 'idempotencyKey'],
  ),
  createPayAsYouGoBooking: objectSchema(
    {
      classSessionId: IDENTIFIER,
      personId: IDENTIFIER,
      productId: IDENTIFIER,
      idempotencyKey: IDEMPOTENCY_KEY,
    },
    ['classSessionId', 'personId', 'productId', 'idempotencyKey'],
  ),
};

export type StudioToolCommand = keyof typeof STUDIO_TOOL_SCHEMAS;

const isIdentifier = (value: unknown): boolean =>
  isString(value) &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const validateProperty = (
  value: unknown,
  schema: InputProperty,
  path: string,
): string | null => {
  if (schema.type === 'object') {
    if (
      !isObject<Record<string, unknown>, unknown>(value) ||
      Array.isArray(value)
    )
      return `${path}: ожидается объект.`;
    const properties = schema.properties ?? {};
    if (
      Object.keys(value).some(
        (key) => !Object.prototype.hasOwnProperty.call(properties, key),
      )
    )
      return `${path}: неизвестное поле.`;
    if (
      schema.required?.some(
        (key) => !Object.prototype.hasOwnProperty.call(value, key),
      )
    )
      return `${path}: отсутствует обязательное поле.`;
    for (const [key, propertyValue] of Object.entries(value)) {
      const error = validateProperty(
        propertyValue,
        properties[key],
        `${path}.${key}`,
      );
      if (error) return error;
      if (key.endsWith('Id') && !isIdentifier(propertyValue))
        return `${path}.${key}: нужен полный UUID.`;
    }
    return null;
  }
  if (schema.type === 'array') {
    if (!Array.isArray(value) || value.length > 100)
      return `${path}: допустимо до 100 участников.`;
    for (const [index, item] of value.entries()) {
      if (schema.items) {
        const error = validateProperty(item, schema.items, `${path}[${index}]`);
        if (error) return error;
      }
    }
    return null;
  }
  if (schema.type === 'string') {
    if (!isString(value) || !value.trim())
      return `${path}: нужна непустая строка.`;
    if (schema.enum && !schema.enum.includes(value))
      return `${path}: недопустимое значение.`;
  } else if (schema.type === 'boolean') {
    if (typeof value !== 'boolean') return `${path}: ожидается true или false.`;
  } else {
    if (
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      (schema.type === 'integer' && !Number.isInteger(value)) ||
      (schema.minimum !== undefined && value < schema.minimum) ||
      (schema.maximum !== undefined && value > schema.maximum)
    )
      return `${path}: число вне допустимого диапазона.`;
  }
  return null;
};

export const validateStudioToolInput = (
  command: StudioToolCommand,
  input: unknown,
):
  | { success: true; input: Record<string, unknown> }
  | { success: false; message: string } => {
  const error = validateProperty(
    input,
    STUDIO_TOOL_SCHEMAS[command],
    'arguments',
  );
  if (error) return { success: false, message: error };
  const parameters = input as Record<string, unknown>;
  if (
    (isString(parameters.idempotencyKey) && parameters.idempotencyKey.length > 200) ||
    (isString(parameters.requestKey) && parameters.requestKey.length > 200) ||
    (isString(parameters.name) && parameters.name.length > 200)
  )
    return {
      success: false,
      message: 'Название и ключ операции — не более 200 символов.',
    };
  if (
    'startsAt' in parameters &&
    (!isString(parameters.startsAt) ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
        parameters.startsAt,
      ) ||
      !Number.isFinite(new Date(parameters.startsAt).getTime()))
  )
    return { success: false, message: 'Нужна дата ISO 8601 с часовым поясом.' };
  if (
    command === 'createSessionPayment' &&
    parameters.status === 'COMPLETED' &&
    parameters.paymentReceivedConfirmed !== true
  )
    return {
      success: false,
      message: 'Подтвердите получение денег перед созданием PAID-оплаты.',
    };
  if (command === 'createSession') {
    const participants = (parameters.participants ?? []) as Record<
      string,
      unknown
    >[];
    if (
      participants.length > (parameters.capacity as number) ||
      new Set(participants.map((participant) => participant.personId)).size !==
        participants.length
    )
      return {
        success: false,
        message: 'Дубли участников и превышение вместимости недопустимы.',
      };
    if (
      parameters.sessionFormat === 'PERSONAL_EQUIPMENT' &&
      parameters.capacity !== 1
    )
      return {
        success: false,
        message: 'Вместимость персональной тренировки — один клиент.',
      };
    if (
      participants.length &&
      (parameters.status === 'CONFIRMED' ||
        parameters.sessionFormat === 'SPLIT_EQUIPMENT')
    )
      return {
        success: false,
        message:
          'Для текущей тренировки и сплита используются отдельные команды.',
      };
    if (
      parameters.status === 'COMPLETED' &&
      (parameters.pastConfirmed !== true ||
        (participants.length > 0 &&
          (!isString(parameters.attendanceReason) ||
            !parameters.attendanceReason.trim())))
    )
      return {
        success: false,
        message:
          'Подтвердите проведение тренировки и основание внесения участников.',
      };
    for (const participant of participants) {
      const packageParticipant = 'membershipId' in participant;
      if (
        packageParticipant
          ? 'productId' in participant || 'paymentId' in participant
          : !('productId' in participant) || !('paymentId' in participant)
      )
        return {
          success: false,
          message:
            'Укажите пакет либо продукт с подготовленной оплатой для каждого участника.',
        };
    }
  }
  return { success: true, input: parameters };
};
