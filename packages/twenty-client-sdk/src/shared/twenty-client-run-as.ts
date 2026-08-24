// The default acts as the person who triggered the run, limited to their role
// intersected with the application's, and as the application alone when nobody
// triggered it. 'application' asks for the application's access either way.
export type TwentyClientRunAs = 'user' | 'application';
