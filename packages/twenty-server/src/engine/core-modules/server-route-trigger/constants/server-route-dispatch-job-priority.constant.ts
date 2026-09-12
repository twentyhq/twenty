// A server route dispatch answers an inbound webhook someone is waiting on,
// so it runs ahead of the database-event fan-out (queue default) and the
// application-enqueued jobs (ENQUEUE_JOB_PRIORITY) sharing the same queue.
export const SERVER_ROUTE_DISPATCH_JOB_PRIORITY = 1;
