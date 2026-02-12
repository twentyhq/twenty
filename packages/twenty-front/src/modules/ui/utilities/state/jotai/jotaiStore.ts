import { createStore } from 'jotai';

// Shared Jotai store used across the application.
// This store is passed to the Jotai Provider in App.tsx and can also be
// accessed imperatively for dual-write bridging during the Recoil → Jotai
// migration (e.g. inside Recoil callbacks that also need to update Jotai).
export const jotaiStore = createStore();
