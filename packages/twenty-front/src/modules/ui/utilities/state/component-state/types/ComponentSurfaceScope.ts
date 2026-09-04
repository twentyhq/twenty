// Whether a component state is isolated per workspace surface (main vs each side
// panel page) or deliberately shared across them.
//
// 'shared' is for state whose instance id is already a real identity - a record
// id, a workflow id - which two surfaces reference on purpose: the side panel
// step editor reads the main diagram's flow through the same instance id.
//
// 'per-surface' is for state whose instance id is a reusable name - a module
// constant naming a role, like a tab list or a dropdown - which collides as soon
// as the same component renders on two surfaces at once.
export type ComponentSurfaceScope = 'per-surface' | 'shared';
