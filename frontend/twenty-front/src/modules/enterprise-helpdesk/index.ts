// Components
export { TicketDetail } from './components/TicketDetail';
export { TicketForm } from './components/TicketForm';
export { TicketList } from './components/TicketList';

// Hooks
export { GET_TICKET_METRICS, CREATE_TICKET, ASSIGN_TICKET, GET_TICKETS } from './hooks/useTickets';

// States
export { ticketsState, ticketsLoadingState, selectedTicketIdState } from './states/helpdeskStates';

// Types
export type { TicketStatus, TicketPriority, TicketChannel, TicketCategory, TicketComment, TicketData } from './types/ticket.types';
