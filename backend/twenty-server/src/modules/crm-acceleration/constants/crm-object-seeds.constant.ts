import { FieldMetadataType } from 'twenty-shared/types';

export type CrmObjectSeed = {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  icon: string;
  description: string;
  fields?: Array<{
    name: string;
    label: string;
    type: FieldMetadataType;
    description: string;
    icon: string;
    isNullable?: boolean;
    defaultValue?: string | number | boolean | null;
  }>;
};

export const CRM_OBJECT_SEEDS: CrmObjectSeed[] = [
  {
    nameSingular: 'pipeline',
    namePlural: 'pipelines',
    labelSingular: 'Pipeline',
    labelPlural: 'Pipelines',
    icon: 'IconTimeline',
    description: 'Pipeline de ventas',
    fields: [
      { name: 'type', label: 'Tipo', type: FieldMetadataType.TEXT, description: 'Tipo de pipeline', icon: 'IconTag', isNullable: true },
      { name: 'description', label: 'Descripción', type: FieldMetadataType.TEXT, description: 'Descripción del pipeline', icon: 'IconNotes', isNullable: true },
      { name: 'isDefault', label: 'Por defecto', type: FieldMetadataType.BOOLEAN, description: '¿Es el pipeline por defecto?', icon: 'IconStar', defaultValue: false },
      { name: 'isActive', label: 'Activo', type: FieldMetadataType.BOOLEAN, description: '¿Está activo?', icon: 'IconCheck', defaultValue: true },
      { name: 'position', label: 'Posición', type: FieldMetadataType.NUMBER, description: 'Orden de visualización', icon: 'IconSort', defaultValue: 0 },
    ],
  },
  {
    nameSingular: 'product',
    namePlural: 'products',
    labelSingular: 'Producto',
    labelPlural: 'Productos',
    icon: 'IconBox',
    description: 'Catálogo de productos y servicios',
    fields: [
      { name: 'description', label: 'Descripción', type: FieldMetadataType.TEXT, description: 'Descripción del producto', icon: 'IconNotes', isNullable: true },
      { name: 'sku', label: 'SKU', type: FieldMetadataType.TEXT, description: 'Código de producto', icon: 'IconBarcode', isNullable: true },
      { name: 'price', label: 'Precio', type: FieldMetadataType.NUMBER, description: 'Precio unitario', icon: 'IconCurrencyDollar', isNullable: true },
      { name: 'cost', label: 'Costo', type: FieldMetadataType.NUMBER, description: 'Costo del producto', icon: 'IconCoins', isNullable: true },
      { name: 'stockQuantity', label: 'Stock', type: FieldMetadataType.NUMBER, description: 'Cantidad en inventario', icon: 'IconPackage', defaultValue: 0 },
      { name: 'category', label: 'Categoría', type: FieldMetadataType.TEXT, description: 'Categoría del producto', icon: 'IconTag', isNullable: true },
      { name: 'isActive', label: 'Activo', type: FieldMetadataType.BOOLEAN, description: '¿Está disponible?', icon: 'IconCheck', defaultValue: true },
      { name: 'isInventoryEnabled', label: 'Control de inventario', type: FieldMetadataType.BOOLEAN, description: '¿Gestionar inventario?', icon: 'IconPackage', defaultValue: false },
    ],
  },
  {
    nameSingular: 'project',
    namePlural: 'projects',
    labelSingular: 'Proyecto',
    labelPlural: 'Proyectos',
    icon: 'IconChecklist',
    description: 'Gestión de proyectos',
    fields: [
      { name: 'description', label: 'Descripción', type: FieldMetadataType.TEXT, description: 'Descripción del proyecto', icon: 'IconNotes', isNullable: true },
      { name: 'status', label: 'Estado', type: FieldMetadataType.TEXT, description: 'Estado del proyecto', icon: 'IconTag', isNullable: true },
      { name: 'startDate', label: 'Fecha inicio', type: FieldMetadataType.DATE, description: 'Fecha de inicio', icon: 'IconCalendar', isNullable: true },
      { name: 'endDate', label: 'Fecha fin', type: FieldMetadataType.DATE, description: 'Fecha de finalización', icon: 'IconCalendarDue', isNullable: true },
      { name: 'budget', label: 'Presupuesto', type: FieldMetadataType.NUMBER, description: 'Presupuesto asignado', icon: 'IconCoins', isNullable: true },
    ],
  },
  {
    nameSingular: 'quote',
    namePlural: 'quotes',
    labelSingular: 'Cotización',
    labelPlural: 'Cotizaciones',
    icon: 'IconFileText',
    description: 'Cotizaciones y propuestas comerciales',
    fields: [
      { name: 'status', label: 'Estado', type: FieldMetadataType.TEXT, description: 'Estado de la cotización', icon: 'IconTag', isNullable: true },
      { name: 'totalAmount', label: 'Total', type: FieldMetadataType.NUMBER, description: 'Monto total', icon: 'IconCurrencyDollar', isNullable: true },
      { name: 'validUntil', label: 'Válida hasta', type: FieldMetadataType.DATE, description: 'Fecha de vencimiento', icon: 'IconCalendarDue', isNullable: true },
      { name: 'notes', label: 'Notas', type: FieldMetadataType.TEXT, description: 'Notas adicionales', icon: 'IconNotes', isNullable: true },
    ],
  },
  {
    nameSingular: 'supportTicket',
    namePlural: 'supportTickets',
    labelSingular: 'Ticket de soporte',
    labelPlural: 'Tickets de soporte',
    icon: 'IconHelpCircle',
    description: 'Gestión de tickets de soporte',
    fields: [
      { name: 'status', label: 'Estado', type: FieldMetadataType.TEXT, description: 'Estado del ticket', icon: 'IconTag', isNullable: true },
      { name: 'priority', label: 'Prioridad', type: FieldMetadataType.TEXT, description: 'Prioridad del ticket', icon: 'IconAlertCircle', isNullable: true },
      { name: 'category', label: 'Categoría', type: FieldMetadataType.TEXT, description: 'Categoría del ticket', icon: 'IconCategory', isNullable: true },
      { name: 'description', label: 'Descripción', type: FieldMetadataType.TEXT, description: 'Descripción del problema', icon: 'IconNotes', isNullable: true },
      { name: 'resolvedAt', label: 'Resuelto el', type: FieldMetadataType.DATE_TIME, description: 'Fecha de resolución', icon: 'IconCalendarCheck', isNullable: true },
    ],
  },
  {
    nameSingular: 'marketingCampaign',
    namePlural: 'marketingCampaigns',
    labelSingular: 'Campaña de marketing',
    labelPlural: 'Campañas de marketing',
    icon: 'IconSpeakerphone',
    description: 'Campañas de marketing y publicidad',
    fields: [
      { name: 'status', label: 'Estado', type: FieldMetadataType.TEXT, description: 'Estado de la campaña', icon: 'IconTag', isNullable: true },
      { name: 'type', label: 'Tipo', type: FieldMetadataType.TEXT, description: 'Tipo de campaña', icon: 'IconCategory', isNullable: true },
      { name: 'startDate', label: 'Fecha inicio', type: FieldMetadataType.DATE, description: 'Fecha de inicio', icon: 'IconCalendar', isNullable: true },
      { name: 'endDate', label: 'Fecha fin', type: FieldMetadataType.DATE, description: 'Fecha de finalización', icon: 'IconCalendarDue', isNullable: true },
      { name: 'budget', label: 'Presupuesto', type: FieldMetadataType.NUMBER, description: 'Presupuesto de la campaña', icon: 'IconCoins', isNullable: true },
      { name: 'targetAudience', label: 'Audiencia objetivo', type: FieldMetadataType.TEXT, description: 'Descripción de la audiencia', icon: 'IconUsers', isNullable: true },
    ],
  },
  {
    nameSingular: 'omnichannelMessage',
    namePlural: 'omnichannelMessages',
    labelSingular: 'Mensaje omnicanal',
    labelPlural: 'Mensajes omnicanal',
    icon: 'IconMessage',
    description: 'Mensajes de WhatsApp, SMS, Email y más',
    fields: [
      { name: 'channel', label: 'Canal', type: FieldMetadataType.TEXT, description: 'Canal de comunicación', icon: 'IconNetwork', isNullable: true },
      { name: 'direction', label: 'Dirección', type: FieldMetadataType.TEXT, description: 'INBOUND / OUTBOUND', icon: 'IconArrowsExchange', isNullable: true },
      { name: 'content', label: 'Contenido', type: FieldMetadataType.TEXT, description: 'Contenido del mensaje', icon: 'IconTextSize', isNullable: true },
      { name: 'status', label: 'Estado', type: FieldMetadataType.TEXT, description: 'Estado del mensaje', icon: 'IconTag', isNullable: true },
      { name: 'senderPhone', label: 'Teléfono remitente', type: FieldMetadataType.TEXT, description: 'Número de teléfono del remitente', icon: 'IconPhone', isNullable: true },
      { name: 'recipientPhone', label: 'Teléfono destinatario', type: FieldMetadataType.TEXT, description: 'Número de teléfono del destinatario', icon: 'IconPhone', isNullable: true },
    ],
  },
  {
    nameSingular: 'inventoryItem',
    namePlural: 'inventoryItems',
    labelSingular: 'Inventario',
    labelPlural: 'Inventario',
    icon: 'IconBuildingWarehouse',
    description: 'Control de inventario y stock',
    fields: [
      { name: 'stockQuantity', label: 'Cantidad en stock', type: FieldMetadataType.NUMBER, description: 'Unidades disponibles', icon: 'IconPackage', defaultValue: 0 },
      { name: 'reorderPoint', label: 'Punto de reorden', type: FieldMetadataType.NUMBER, description: 'Cantidad mínima antes de reordenar', icon: 'IconAlertCircle', isNullable: true },
      { name: 'location', label: 'Ubicación', type: FieldMetadataType.TEXT, description: 'Ubicación en almacén', icon: 'IconMapPin', isNullable: true },
      { name: 'unitCost', label: 'Costo unitario', type: FieldMetadataType.NUMBER, description: 'Costo por unidad', icon: 'IconCoins', isNullable: true },
    ],
  },
  {
    nameSingular: 'gamificationBadge',
    namePlural: 'gamificationBadges',
    labelSingular: 'Badge',
    labelPlural: 'Badges',
    icon: 'IconAward',
    description: 'Insignias y logros del sistema de gamificación',
    fields: [
      { name: 'description', label: 'Descripción', type: FieldMetadataType.TEXT, description: 'Descripción del badge', icon: 'IconNotes', isNullable: true },
      { name: 'icon', label: 'Ícono', type: FieldMetadataType.TEXT, description: 'Ícono del badge', icon: 'IconPhoto', isNullable: true },
      { name: 'pointsRequired', label: 'Puntos requeridos', type: FieldMetadataType.NUMBER, description: 'Puntos necesarios para obtener el badge', icon: 'IconStar', defaultValue: 0 },
      { name: 'isActive', label: 'Activo', type: FieldMetadataType.BOOLEAN, description: '¿Está activo?', icon: 'IconCheck', defaultValue: true },
    ],
  },
  {
    nameSingular: 'voipCall',
    namePlural: 'voipCalls',
    labelSingular: 'Llamada',
    labelPlural: 'Llamadas',
    icon: 'IconPhone',
    description: 'Registro de llamadas VoIP',
    fields: [
      { name: 'phoneNumber', label: 'Teléfono', type: FieldMetadataType.TEXT, description: 'Número de teléfono', icon: 'IconPhone', isNullable: true },
      { name: 'direction', label: 'Dirección', type: FieldMetadataType.TEXT, description: 'INBOUND / OUTBOUND', icon: 'IconArrowsExchange', isNullable: true },
      { name: 'status', label: 'Estado', type: FieldMetadataType.TEXT, description: 'Estado de la llamada', icon: 'IconTag', isNullable: true },
      { name: 'duration', label: 'Duración (seg)', type: FieldMetadataType.NUMBER, description: 'Duración en segundos', icon: 'IconClock', isNullable: true },
      { name: 'recordingUrl', label: 'URL de grabación', type: FieldMetadataType.TEXT, description: 'Enlace a la grabación', icon: 'IconMicrophone', isNullable: true },
      { name: 'sentiment', label: 'Sentimiento', type: FieldMetadataType.TEXT, description: 'Análisis de sentimiento', icon: 'IconMoodSmile', isNullable: true },
    ],
  },
  {
    nameSingular: 'electronicSignature',
    namePlural: 'electronicSignatures',
    labelSingular: 'Firma electrónica',
    labelPlural: 'Firmas electrónicas',
    icon: 'IconSignature',
    description: 'Solicitudes de firma electrónica de documentos',
    fields: [
      { name: 'documentName', label: 'Documento', type: FieldMetadataType.TEXT, description: 'Nombre del documento', icon: 'IconFile', isNullable: true },
      { name: 'status', label: 'Estado', type: FieldMetadataType.TEXT, description: 'Estado de la firma', icon: 'IconTag', isNullable: true },
      { name: 'signerEmail', label: 'Email del firmante', type: FieldMetadataType.EMAILS, description: 'Email de quien firma', icon: 'IconMail', isNullable: true },
      { name: 'expiresAt', label: 'Expira el', type: FieldMetadataType.DATE_TIME, description: 'Fecha de expiración', icon: 'IconCalendarDue', isNullable: true },
    ],
  },
  {
    nameSingular: 'liveChatSession',
    namePlural: 'liveChatSessions',
    labelSingular: 'Sesión de chat',
    labelPlural: 'Sesiones de chat',
    icon: 'IconMessageCircle',
    description: 'Sesiones de chat en vivo con visitantes',
    fields: [
      { name: 'visitorName', label: 'Nombre del visitante', type: FieldMetadataType.TEXT, description: 'Nombre del visitante', icon: 'IconUser', isNullable: true },
      { name: 'visitorEmail', label: 'Email del visitante', type: FieldMetadataType.EMAILS, description: 'Email del visitante', icon: 'IconMail', isNullable: true },
      { name: 'status', label: 'Estado', type: FieldMetadataType.TEXT, description: 'Estado de la sesión', icon: 'IconTag', isNullable: true },
      { name: 'source', label: 'Fuente', type: FieldMetadataType.TEXT, description: 'Página de origen', icon: 'IconLink', isNullable: true },
      { name: 'rating', label: 'Calificación', type: FieldMetadataType.NUMBER, description: 'Calificación del cliente (1-5)', icon: 'IconStar', isNullable: true },
    ],
  },
  {
    nameSingular: 'automationRule',
    namePlural: 'automationRules',
    labelSingular: 'Regla de automatización',
    labelPlural: 'Reglas de automatización',
    icon: 'IconRobot',
    description: 'Reglas de automatización de procesos de ventas',
    fields: [
      { name: 'triggerType', label: 'Tipo de trigger', type: FieldMetadataType.TEXT, description: 'Evento que dispara la regla', icon: 'IconBolt', isNullable: true },
      { name: 'actionType', label: 'Tipo de acción', type: FieldMetadataType.TEXT, description: 'Acción a ejecutar', icon: 'IconPlayerPlay', isNullable: true },
      { name: 'isActive', label: 'Activa', type: FieldMetadataType.BOOLEAN, description: '¿Está activa?', icon: 'IconCheck', defaultValue: true },
      { name: 'description', label: 'Descripción', type: FieldMetadataType.TEXT, description: 'Descripción de la regla', icon: 'IconNotes', isNullable: true },
    ],
  },
  {
    nameSingular: 'knowledgeArticle',
    namePlural: 'knowledgeArticles',
    labelSingular: 'Artículo de conocimiento',
    labelPlural: 'Artículos de conocimiento',
    icon: 'IconBook',
    description: 'Base de conocimiento y documentación interna',
    fields: [
      { name: 'content', label: 'Contenido', type: FieldMetadataType.TEXT, description: 'Contenido del artículo', icon: 'IconTextSize', isNullable: true },
      { name: 'category', label: 'Categoría', type: FieldMetadataType.TEXT, description: 'Categoría del artículo', icon: 'IconTag', isNullable: true },
      { name: 'isPublished', label: 'Publicado', type: FieldMetadataType.BOOLEAN, description: '¿Está publicado?', icon: 'IconEye', defaultValue: false },
      { name: 'viewCount', label: 'Vistas', type: FieldMetadataType.NUMBER, description: 'Número de vistas', icon: 'IconEye', defaultValue: 0 },
    ],
  },
  {
    nameSingular: 'marketplaceIntegration',
    namePlural: 'marketplaceIntegrations',
    labelSingular: 'Integración',
    labelPlural: 'Integraciones',
    icon: 'IconPlug',
    description: 'Integraciones con aplicaciones externas',
    fields: [
      { name: 'provider', label: 'Proveedor', type: FieldMetadataType.TEXT, description: 'Nombre del proveedor', icon: 'IconBrandApple', isNullable: true },
      { name: 'status', label: 'Estado', type: FieldMetadataType.TEXT, description: 'Estado de la integración', icon: 'IconTag', isNullable: true },
      { name: 'lastSyncAt', label: 'Última sincronización', type: FieldMetadataType.DATE_TIME, description: 'Fecha de última sincronización', icon: 'IconRefresh', isNullable: true },
    ],
  },
  {
    nameSingular: 'document',
    namePlural: 'documents',
    labelSingular: 'Documento',
    labelPlural: 'Documentos',
    icon: 'IconFile',
    description: 'Documentos y archivos',
    fields: [
      { name: 'type', label: 'Tipo', type: FieldMetadataType.TEXT, description: 'Tipo de documento', icon: 'IconTag', isNullable: true },
      { name: 'fileUrl', label: 'URL del archivo', type: FieldMetadataType.TEXT, description: 'Enlace al archivo', icon: 'IconLink', isNullable: true },
      { name: 'status', label: 'Estado', type: FieldMetadataType.TEXT, description: 'Estado del documento', icon: 'IconTag', isNullable: true },
    ],
  },
  {
    nameSingular: 'leadScore',
    namePlural: 'leadScores',
    labelSingular: 'Lead score',
    labelPlural: 'Lead scores',
    icon: 'IconChartBar',
    description: 'Puntuación y calificación de leads',
    fields: [
      { name: 'score', label: 'Puntuación', type: FieldMetadataType.NUMBER, description: 'Puntuación del lead (0-100)', icon: 'IconStar', defaultValue: 0 },
      { name: 'grade', label: 'Calificación', type: FieldMetadataType.TEXT, description: 'Calificación (A, B, C, D)', icon: 'IconTag', isNullable: true },
      { name: 'lastCalculatedAt', label: 'Calculado el', type: FieldMetadataType.DATE_TIME, description: 'Fecha del último cálculo', icon: 'IconCalendar', isNullable: true },
    ],
  },
];
