// Main entry point for twenty-sdk
// Re-export metadata SDK
export * from './generated/metadata';

// Re-export core SDK (dynamically generated workspace resolvers)
// Should handle conflicts here
export * from './generated/core';
