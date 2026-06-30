FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    git \
    make \
    build-essential \
    postgresql-client \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Install nvm (project recommends nvm + .nvmrc for consistent Node versions)
ENV NVM_DIR=/usr/local/nvm
RUN mkdir -p $NVM_DIR \
    && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash

SHELL ["/bin/bash", "-c"]

# Copy .nvmrc so nvm install picks up the right version
COPY .nvmrc /tmp/.nvmrc

# Install Node.js from .nvmrc, enable Corepack, and symlink binaries
# so they're available on PATH without hardcoding a version
RUN . $NVM_DIR/nvm.sh \
    && nvm install $(cat /tmp/.nvmrc) \
    && nvm alias default $(cat /tmp/.nvmrc) \
    && corepack enable \
    && BIN_DIR=$(dirname $(nvm which default)) \
    && ln -sf $BIN_DIR/node /usr/local/bin/node \
    && ln -sf $BIN_DIR/npm /usr/local/bin/npm \
    && ln -sf $BIN_DIR/npx /usr/local/bin/npx \
    && ln -sf $BIN_DIR/corepack /usr/local/bin/corepack
