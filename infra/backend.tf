# backend.tf

# Create three random UUIDs
resource "random_uuid" "access_token_secret" {}
resource "random_uuid" "login_token_secret" {}
resource "random_uuid" "refresh_token_secret" {}
resource "random_uuid" "file_token_secret" {}

resource "azurerm_container_app" "day1ai_server" {
  name                         = local.server_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  depends_on = [azurerm_container_app.day1ai_db, azurerm_container_app_environment_storage.server]

  ingress {
    allow_insecure_connections = false
    external_enabled           = true
    target_port                = 3000
    transport                  = "http"
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    min_replicas = 1
    max_replicas = 1
    volume {
      name         = "day1ai-server-data"
      storage_type = "AzureFile"
      storage_name = local.storage_mount_server_name
    }

    container {
      name   = local.server_name
      image  = "docker.io/twentycrm/twenty-server:${local.server_tag}"
      cpu    = local.cpu
      memory = local.memory

      volume_mounts {
        name = "day1ai-server-data"
        path = "/app/packages/twenty-server/.local-storage"
      }

      # Environment variables
      env {
        name  = "IS_SIGN_UP_DISABLED"
        value = false
      }
      env {
        name  = "SIGN_IN_PREFILLED"
        value = false
      }
      env {
        name  = "STORAGE_TYPE"
        value = "local"
      }
      env {
        name  = "STORAGE_LOCAL_PATH"
        value = ".local-storage"
      }
      env {
        name  = "PG_DATABASE_URL"
        value = "postgres://${local.db_user}:${local.db_password}@${local.db_app_name}:5432/default"
      }
      env {
        name  = "FRONT_BASE_URL"
        value = "https://${local.front_app_name}"
      }
      env {
        name  = "ACCESS_TOKEN_SECRET"
        value = random_uuid.access_token_secret.result
      }
      env {
        name  = "LOGIN_TOKEN_SECRET"
        value = random_uuid.login_token_secret.result
      }
      env {
        name  = "REFRESH_TOKEN_SECRET"
        value = random_uuid.refresh_token_secret.result
      }
      env {
        name  = "FILE_TOKEN_SECRET"
        value = random_uuid.file_token_secret.result
      }
    }
  }
}

# Set CORS rules for server app using AzAPI
resource "azapi_update_resource" "server_cors" {
  type        = "Microsoft.App/containerApps@2023-05-01"
  resource_id = azurerm_container_app.day1ai_server.id
  body = jsonencode({
    properties = {
      configuration = {
        ingress = {
          corsPolicy = {
            allowedOrigins = ["*"]
          }
        }
      }
    }
  })
  depends_on = [azurerm_container_app.day1ai_server]
}